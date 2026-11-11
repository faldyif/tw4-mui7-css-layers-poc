export type Variant = {
  slug: string;
  title: string;
  setup: string[];
  tailwind: boolean;
};

export const LAYER_ORDER = '@layer theme, base, mui, components, utilities;';

export const VARIANTS: Variant[] = [
  {
    slug: 'baseline',
    title: 'Baseline: no Tailwind',
    setup: ['MUI with default settings.', 'No Tailwind CSS on the page.'],
    tailwind: false,
  },
  {
    slug: 'default',
    title: 'Tailwind + MUI default',
    setup: ['src/tailwind.css: @import "tailwindcss";', 'MUI with default settings (Emotion styles are not in a layer).'],
    tailwind: true,
  },
  {
    slug: 'layer-no-order',
    title: 'enableCssLayer, no layer order',
    setup: ['src/tailwind.css: @import "tailwindcss";', '<StyledEngineProvider enableCssLayer>'],
    tailwind: true,
  },
  {
    slug: 'layer-order-in-css',
    title: 'enableCssLayer + layer order in the CSS file',
    setup: [`src/tailwind-with-layer-order.css: ${LAYER_ORDER} before @import "tailwindcss";`, '<StyledEngineProvider enableCssLayer>'],
    tailwind: true,
  },
  {
    slug: 'layer-order-in-html',
    title: 'enableCssLayer + layer order in index.html',
    setup: [`<style>${LAYER_ORDER}</style> in the HTML <head>`, 'src/tailwind.css: @import "tailwindcss";', '<StyledEngineProvider enableCssLayer>'],
    tailwind: true,
  },
  {
    slug: 'layer-order-globalstyles',
    title: 'enableCssLayer + layer order in GlobalStyles',
    setup: ['src/tailwind.css: @import "tailwindcss";', '<StyledEngineProvider enableCssLayer>', `<GlobalStyles styles="${LAYER_ORDER}" />`],
    tailwind: true,
  },
  {
    slug: 'layer-order-css-and-globalstyles',
    title: 'enableCssLayer + layer order in the CSS file and in GlobalStyles',
    setup: [`src/tailwind-with-layer-order.css: ${LAYER_ORDER} before @import "tailwindcss";`, '<StyledEngineProvider enableCssLayer>', `<GlobalStyles styles="${LAYER_ORDER}" />`],
    tailwind: true,
  },
  {
    slug: 'layer-modular',
    title: 'enableCssLayer + theme modularCssLayers',
    setup: ['src/tailwind.css: @import "tailwindcss";', '<StyledEngineProvider enableCssLayer>', `createTheme({ modularCssLayers: '${LAYER_ORDER}' })`],
    tailwind: true,
  },
  {
    slug: 'modular-only',
    title: 'theme modularCssLayers only (no enableCssLayer)',
    setup: ['src/tailwind.css: @import "tailwindcss";', 'MUI StyledEngineProvider without enableCssLayer', `createTheme({ modularCssLayers: '${LAYER_ORDER}' })`],
    tailwind: true,
  },
];
