// Makes the annotated screenshots in screenshots/ from the production build.
// Usage: npm run build && npm run screenshots
// Set CHROMIUM_PATH to use a local Chromium binary.
import { chromium } from 'playwright-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const serve = root => new Promise(r => { const s = http.createServer((q, res) => { const f = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); });
const dist = await serve(path.resolve('dist'));
const OUT = path.resolve('screenshots');
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

// helper injected into the page: label + outline
const annotate = `
window.__label = (text, x, y, color, w) => { const d = document.createElement('div'); d.textContent = text;
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', zIndex: 99999, font: '600 13px/18px system-ui, sans-serif', color: '#fff', background: color, padding: '4px 8px', borderRadius: '4px', maxWidth: (w || 320) + 'px', whiteSpace: 'normal' }); document.body.appendChild(d); return d; };
window.__box = (el, color) => { const r = el.getBoundingClientRect(); const d = document.createElement('div');
  Object.assign(d.style, { position: 'fixed', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', border: '3px solid ' + color, borderRadius: '6px', zIndex: 99998, pointerEvents: 'none', boxSizing: 'border-box' }); document.body.appendChild(d); return r; };
`;

try {
  // ---- Dialog shots (page "default", 1200px) ----
  for (const [keep, hide, color, file] of [
    ['dialog-root-class', 'dialog-paper-class', '#d32f2f', 'dialog-classname-on-root.png'],
    ['dialog-paper-class', 'dialog-root-class', '#2e7d32', 'dialog-classname-on-paper.png'],
  ]) {
    const p = await b.newPage({ viewport: { width: 1200, height: 420 }, deviceScaleFactor: 2 });
    await p.goto(`http://127.0.0.1:${dist.address().port}/default.html`);
    await p.waitForFunction(() => window.__results);
    await p.evaluate(annotate);
    const info = await p.evaluate(({ keep, hide, color }) => {
      document.getElementById('panel').style.display = 'none';
      document.getElementById('wrap').style.visibility = 'hidden';
      document.getElementById(hide).style.display = 'none';
      document.body.style.background = '#eef0f3';
      const paper = document.getElementById(keep + '-paper');
      const r = window.__box(paper, color);
      // viewport center line
      const line = document.createElement('div');
      Object.assign(line.style, { position: 'fixed', left: '600px', top: '0', width: '0', height: '100%', borderLeft: '2px dashed #555', zIndex: 99997 });
      document.body.appendChild(line);
      window.__label('viewport center (600px)', 608, 12, '#555');
      const w = Math.round(r.width), off = Math.round(r.left + r.width / 2 - 600);
      const text = keep === 'dialog-root-class'
        ? `<Dialog className="w-full md:w-146.5"> → paper ${w}px wide, ${-off}px left of center`
        : `<Dialog slotProps={{ paper: { className: "w-full md:w-146.5" } }}> → paper ${w}px wide, centered`;
      window.__label(text, Math.max(16, r.left), r.bottom + 14, color, 560);
      return { w, off };
    }, { keep, hide, color });
    await p.screenshot({ path: `${OUT}/${file}`, clip: { x: 150, y: 0, width: 900, height: 420 } });
    console.log(file, info);
    await p.close();
  }

  // ---- MUI components with Preflight: layer order in the CSS file only vs also in GlobalStyles ----
  for (const [page, ok, file, title] of [
    ['layer-order-in-css.html', false, 'mui-layer-order-in-css-only.png', 'Page layer-order-in-css: layer order in the CSS file only'],
    ['layer-order-css-and-globalstyles.html', true, 'mui-layer-order-css-and-globalstyles.png', 'Page layer-order-css-and-globalstyles: layer order in the CSS file and in GlobalStyles'],
  ]) {
    const p = await b.newPage({ viewport: { width: 820, height: 600 }, deviceScaleFactor: 2 });
    await p.goto(`http://127.0.0.1:${dist.address().port}/${page}`);
    await p.waitForFunction(() => window.__results);
    await p.evaluate(annotate);
    const vals = await p.evaluate(({ ok, title }) => {
      document.getElementById('panel').style.display = 'none';
      for (const id of ['dialog-root-class', 'dialog-paper-class']) document.getElementById(id).style.display = 'none';
      const wrap = document.getElementById('wrap');
      const keep = ['mui-button', 'mui-h1', 'mui-divider'];
      for (const el of [...wrap.children]) {
        const id = el.id || el.querySelector('[id]')?.id;
        const isTf = !!el.querySelector('#mui-textfield');
        if (!keep.includes(el.id) && !isTf) el.style.display = 'none';
      }
      Object.assign(wrap.style, { width: '330px', padding: '56px 0 0 24px', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'flex-start' });
      document.getElementById('mui-divider').style.alignSelf = 'stretch';
      document.body.style.background = '#fff';
      window.__label(title, 24, 12, '#333', 780);
      const color = ok ? '#2e7d32' : '#d32f2f';
      const cs = (el, p) => getComputedStyle(el).getPropertyValue(p);
      const btn = document.getElementById('mui-button'), h1 = document.getElementById('mui-h1');
      const fs = document.querySelector('#mui-textfield ~ fieldset'), dv = document.getElementById('mui-divider');
      const tfRoot = fs.parentElement;
      const rows = [
        [btn, `Button: padding ${cs(btn, 'padding-left')}, background ${cs(btn, 'background-color') === 'rgba(0, 0, 0, 0)' ? 'transparent' : 'blue'}`],
        [h1, `Typography h1: font-size ${cs(h1, 'font-size')}`],
        [tfRoot, `TextField: outline border ${cs(fs, 'border-top-width')}`],
        [dv, `Divider: border ${cs(dv, 'border-bottom-width')}`],
      ];
      const out = []; let prev = 0, maxBottom = 0;
      for (const [el, text] of rows) {
        const r = window.__box(el, color);
        const y = Math.max(r.top + r.height / 2 - 13, prev + 8);
        const d = window.__label((ok ? '✓ ' : '✗ ') + text, 400, y, color, 400);
        d.style.whiteSpace = 'nowrap';
        prev = d.getBoundingClientRect().bottom;
        maxBottom = Math.max(maxBottom, prev, r.bottom + 4);
        out.push(text);
      }
      return { out, h: Math.ceil(maxBottom + 20) };
    }, { ok, title });
    await p.screenshot({ path: `${OUT}/${file}`, clip: { x: 0, y: 0, width: 820, height: vals.h } });
    console.log(file, vals);
    await p.close();
  }
} finally { await b.close(); dist.close(); }
