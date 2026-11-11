import { useEffect, useState } from 'react';
import { measure, type Row } from './checks';
import type { Variant } from './variants';

// All panel styles are inline, so Tailwind, Preflight and MUI do not change the panel
const font = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const S = {
  shell: { position: 'fixed', inset: 0, zIndex: 99999, overflow: 'auto', background: '#fff', color: '#111', fontFamily: font, fontSize: 14, lineHeight: '20px', padding: 24, boxSizing: 'border-box' },
  h1: { fontSize: 22, lineHeight: '28px', fontWeight: 700, margin: '0 0 8px' },
  h2: { fontSize: 15, lineHeight: '20px', fontWeight: 700, margin: '20px 0 6px' },
  code: { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 13, background: '#f3f3f3', padding: '1px 4px', borderRadius: 3 },
  row: { display: 'grid', gridTemplateColumns: 'minmax(260px, 2fr) minmax(200px, 1.4fr) minmax(200px, 1.4fr)', gap: 12, padding: '6px 0', borderBottom: '1px solid #e5e5e5' },
  toggle: { position: 'fixed', right: 16, bottom: 16, zIndex: 100000, fontFamily: font, fontSize: 14, padding: '8px 12px', border: '1px solid #333', borderRadius: 6, background: '#fff', color: '#111', cursor: 'pointer' },
} as const;

const mark = (ok: boolean | null) =>
  ok === null ? { color: '#666', sign: '–' } : ok ? { color: '#0a7a2f', sign: '✓' } : { color: '#b00020', sign: '✗' };

export function Panel({ variant }: { variant: Variant }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [vw, setVw] = useState(window.innerWidth);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const run = () => {
      const r = measure(variant.tailwind);
      setRows(r);
      setVw(window.innerWidth);
      (window as any).__results = { variant: variant.slug, viewport: window.innerWidth, rows: r };
    };
    const t = setTimeout(run, 300);
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(run, 300); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [variant]);

  const groups = [...new Set(rows.map(r => r.group))];

  return (
    <>
      <button style={S.toggle} onClick={() => setHidden(h => !h)}>{hidden ? 'Show results' : 'Show test elements'}</button>
      {hidden ? null : (
        <div style={S.shell}>
          <div style={{ marginBottom: 8 }}><a href="./index.html" style={{ color: '#0645ad' }}>← All pages</a></div>
          <h1 style={S.h1}>{variant.title}</h1>
          <div>Setup:</div>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, listStyle: 'disc' }}>
            {variant.setup.map(s => <li key={s}><span style={S.code}>{s}</span></li>)}
          </ul>
          <p style={{ margin: '12px 0 0' }}>
            Viewport width: <b>{vw}px</b>. Tailwind <span style={S.code}>md</span> starts at 768px. Resize the window to measure again.
            The values come from <span style={S.code}>getComputedStyle</span> on the test elements behind this panel.
          </p>
          {groups.map(g => (
            <div key={g}>
              <h2 style={S.h2}>{g}</h2>
              <div style={{ ...S.row, fontWeight: 600, color: '#555' }}><div>Test</div><div>Measured</div><div>Result</div></div>
              {rows.filter(r => r.group === g).map(r => {
                const m = mark(r.ok);
                return (
                  <div key={r.id} style={S.row} data-row={r.id}>
                    <div><span style={S.code}>{r.label}</span></div>
                    <div>{r.measured}</div>
                    <div style={{ color: m.color }}>{m.sign} {r.outcome}</div>
                  </div>
                );
              })}
            </div>
          ))}
          <p style={{ margin: '20px 0 40px', color: '#555' }}>✓ = the result that a developer expects (the class applies, MUI stays the same, the dialog is correct). ✗ = a different result.</p>
        </div>
      )}
    </>
  );
}
