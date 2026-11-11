# Tailwind CSS v4 with MUI v7 and styled-components

This project tests which styles win when an app uses Tailwind CSS v4, MUI v7 (Emotion) and styled-components together.

Open it in the browser, with no install:
https://stackblitz.com/github/faldyif/tw4-mui7-css-layers-poc

The StackBlitz preview pane is narrow (less than 768px). To test the Tailwind `md` breakpoint, open the preview in a new tab and make the window wider than 768px.

## Questions

1. Does a Tailwind class override an MUI `sx` style or an MUI component style on the same property?
2. Does a Tailwind class override a styled-components style on the same property?
3. Does the Tailwind Preflight reset change MUI components?
4. Which MUI cascade layer setup lets Tailwind classes win and keeps MUI components unchanged?
5. Where does `className` go on an MUI `Dialog` to make the paper responsive?

## Versions

| Package | Version |
|---|---|
| tailwindcss, @tailwindcss/vite | 4.3.5 |
| @mui/material | 7.3.11 |
| @emotion/react, @emotion/styled | 11.14.0, 11.14.1 |
| styled-components | 6.6.0 |
| react, react-dom | 19.3.1 |
| vite | 8.3.8 |

## Pages

All pages render the same test elements. Only the setup is different.

| Page | Setup |
|---|---|
| `baseline` | MUI with default settings. No Tailwind. |
| `default` | `@import "tailwindcss";` and MUI with default settings. |
| `layer-no-order` | `<StyledEngineProvider enableCssLayer>`. No layer order. |
| `layer-order-in-css` | `enableCssLayer`. The CSS file declares `@layer theme, base, mui, components, utilities;` before `@import "tailwindcss";`. |
| `layer-order-in-html` | `enableCssLayer`. A `<style>` tag in the HTML `<head>` declares the layer order. |
| `layer-order-globalstyles` | `enableCssLayer` and `<GlobalStyles styles="@layer theme, base, mui, components, utilities;" />`. |
| `layer-order-css-and-globalstyles` | `enableCssLayer`. The layer order is in the CSS file and in `<GlobalStyles>`. |
| `layer-modular` | `enableCssLayer` and `createTheme({ modularCssLayers: '@layer theme, base, mui, components, utilities;' })`. |
| `modular-only` | `modularCssLayers` without `enableCssLayer`. |

Each page has a results panel. The panel reads `getComputedStyle` from the test elements. Click "Show test elements" to see the elements.

## Results

Viewport 1200px, Chromium, production build. ✓ = the result that a developer expects. ✗ = a different result.

| Test | default | layer-no-order | layer-order-in-css | layer-order-in-html | layer-order-globalstyles | layer-order-css-and-globalstyles | layer-modular | modular-only |
|---|---|---|---|---|---|---|---|---|
| `sx={{ width: 300 }}` + `w-full` | ✗ 300px | ✓ 500px | ✓ 500px | ✓ 500px | ✓ 500px | ✓ 500px | ✓ 500px | ✗ 300px |
| `sx={{ width: 300 }}` + `w-full!` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Paper `p-8` (MUI does not set padding) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Paper `rounded-none` | ✗ 4px | ✓ 0px | ✓ 0px | ✓ 0px | ✓ 0px | ✓ 0px | ✓ 0px | ✓ 0px |
| Button `px-10` | ✗ 16px | ✓ 40px | ✓ 40px | ✓ 40px | ✓ 40px | ✓ 40px | ✓ 40px | ✓ 40px |
| styled-components `width: 300px` + `w-full` | ✗ 300px | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| styled-components `width: 300px` + `w-full!` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `<Dialog className="w-full md:w-146.5">` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `<Dialog slotProps={{ paper: { className: "w-full md:w-146.5" } }}>` | ✓ 586px | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MUI Button padding and background | ✓ | ✗ 0px, transparent | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| MUI Typography h1 font size | ✓ 96px | ✗ 16px | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| MUI TextField and Divider borders | ✓ 1px | ✗ 0px | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |

At viewport 600px, the results are the same, with one difference: in `layer-no-order`, `layer-order-in-css` and `layer-order-in-html`, the slotProps dialog paper is 600px wide, not 536px. Preflight removes the MUI paper margin.

## Findings

1. With the MUI default settings, Emotion styles are not in a cascade layer. Tailwind v4 puts its classes in `@layer utilities`. A style that is not in a layer overrides a style in a layer, at all specificities. Thus a Tailwind class does not override an MUI style on the same property. A Tailwind class on a property that MUI does not set applies normally.
2. The `!` suffix (`w-full!`) makes the Tailwind class win in all setups.
3. styled-components v6 styles are not in a layer. They override Tailwind classes in all setups, also when MUI uses `enableCssLayer`.
4. With `enableCssLayer` only, or with the layer order in the CSS file or in the HTML, the `mui` layer comes before the Tailwind `base` layer. Thus the Preflight reset overrides MUI component styles.
5. Two setups let Tailwind classes win and keep MUI components unchanged:
   - `enableCssLayer` with the layer order in `<GlobalStyles>`. The layer order can also be in the CSS file, but the `<GlobalStyles>` line is the one that sets it.
   - `enableCssLayer` with `modularCssLayers` in the theme.
6. `modularCssLayers` without `enableCssLayer` puts `sx` styles in a layer that comes after `utilities`. Thus `sx` styles still override Tailwind classes.
7. `className` on `Dialog` goes to the root element, not to the paper. At 1200px, `md:w-146.5` makes the root 586px wide and aligned left. Thus the dialog is not centered (307px to the left). `slotProps.paper.className` gives the expected paper width.

## Screenshots

The `screenshots/` folder has annotated screenshots of some results. `npm run screenshots` makes them again from the production build.

## Run it locally

```sh
npm install
npm run build
npm run preview
```

To print all results in the terminal:

```sh
npx playwright-core install chromium   # or set CHROMIUM_PATH to a local Chromium
npm run build
npm run verify
```

`npm run verify` opens all pages at 600px and 1200px and writes `results.json`.

## Limits

- The tests use Chromium only.
- The tests use the production build. The Vite dev server can insert styles in a different order. This project does not test the dev server.
- The project tests a small set of properties. Other properties can give other results.
