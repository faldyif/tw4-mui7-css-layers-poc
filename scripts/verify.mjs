// Opens every page of the production build in headless Chromium and prints the panel results.
// Usage: npm run build && npm run verify
// Set CHROMIUM_PATH to use a local Chromium binary.
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PAGES = ['baseline', 'default', 'layer-no-order', 'layer-order-in-css', 'layer-order-in-html', 'layer-order-globalstyles', 'layer-modular', 'modular-only'];
const WIDTHS = [600, 1200];

const root = path.resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--disable-gpu'] });
const results = {};
try {
  for (const width of WIDTHS) {
    for (const slug of PAGES) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${base}/${slug}.html`);
      await page.waitForFunction(() => window.__results);
      results[`${slug}@${width}`] = await page.evaluate(() => window.__results);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

fs.writeFileSync('results.json', JSON.stringify(results, null, 2) + '\n');

// One table per viewport width: rows = tests, columns = pages
const sign = ok => (ok === null ? '–' : ok ? '✓' : '✗');
for (const width of WIDTHS) {
  console.log(`\n## Viewport ${width}px\n`);
  const ids = results[`baseline@${width}`].rows.map(r => r.id);
  console.log(['test', ...PAGES].join(' | '));
  for (const id of ids) {
    const cells = PAGES.map(slug => {
      const r = results[`${slug}@${width}`].rows.find(x => x.id === id);
      return `${sign(r.ok)} ${r.measured.replace(/^[a-z-]+: /, '')}`;
    });
    console.log([id, ...cells].join(' | '));
  }
}
