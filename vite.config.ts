import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

const pages = ['index', 'baseline', 'default', 'layer-no-order', 'layer-order-in-css', 'layer-order-in-html', 'layer-order-globalstyles', 'layer-modular', 'modular-only'];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map(p => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});
