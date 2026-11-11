import { createRoot } from 'react-dom/client';
import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { TestElements } from './TestElements';
import { Panel } from './Panel';
import { VARIANTS } from './variants';

type Options = {
  enableCssLayer?: boolean;
  globalLayerOrder?: string;
  modularCssLayers?: string;
};

export function mount(slug: string, { enableCssLayer = false, globalLayerOrder, modularCssLayers }: Options = {}) {
  const variant = VARIANTS.find(v => v.slug === slug)!;
  document.title = variant.title;

  let tree = <TestElements />;
  if (modularCssLayers !== undefined) tree = <ThemeProvider theme={createTheme({ modularCssLayers })}>{tree}</ThemeProvider>;

  createRoot(document.getElementById('root')!).render(
    <StyledEngineProvider enableCssLayer={enableCssLayer}>
      {globalLayerOrder ? <GlobalStyles styles={globalLayerOrder} /> : null}
      {tree}
    </StyledEngineProvider>,
  );
  createRoot(document.getElementById('panel')!).render(<Panel variant={variant} />);
}
