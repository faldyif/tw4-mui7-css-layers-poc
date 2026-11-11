import { createRoot } from 'react-dom/client';
import { VARIANTS } from './variants';

const font = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

function Index() {
  return (
    <div style={{ fontFamily: font, fontSize: 15, lineHeight: '22px', color: '#111', maxWidth: 820, margin: '32px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Tailwind CSS v4 with MUI v7 and styled-components</h1>
      <p style={{ margin: '0 0 16px' }}>
        Each page renders the same test elements with a different setup. A panel on each page shows the computed styles and the result.
        Open the pages in order and compare them with the baseline.
      </p>
      <ol style={{ paddingLeft: 22 }}>
        {VARIANTS.map(v => (
          <li key={v.slug} style={{ marginBottom: 10 }}>
            <a href={`./${v.slug}.html`} style={{ color: '#0645ad', fontWeight: 600 }}>{v.title}</a>
            <div style={{ color: '#444', fontSize: 13 }}>{v.setup.join(' · ')}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Index />);
