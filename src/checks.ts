export type Row = {
  group: string;
  id: string;
  label: string;
  measured: string;
  outcome: string;
  // true: the result a developer expects (class applies, MUI unchanged, dialog correct)
  ok: boolean | null;
};

const MD_BREAKPOINT = 768; // Tailwind default md = 48rem
const MUI_BLUE = 'rgb(25, 118, 210)';

const style = (id: string) => getComputedStyle(document.getElementById(id)!);
const num = (v: string) => Math.round(parseFloat(v) * 10) / 10;

function classVsOther(group: string, id: string, label: string, prop: string, tailwindValue: string, otherName: string, tailwind: boolean): Row {
  const measured = style(id).getPropertyValue(prop);
  if (!tailwind) return { group, id, label, measured: `${prop}: ${measured}`, outcome: 'Not applicable (no Tailwind)', ok: null };
  const applied = measured === tailwindValue;
  return {
    group,
    id,
    label,
    measured: `${prop}: ${measured}`,
    outcome: applied ? 'Tailwind class applies' : `${otherName} overrides the Tailwind class`,
    ok: applied,
  };
}

function muiUnchanged(id: string, label: string, prop: string, baseline: string, selector?: string): Row {
  const el = selector ? document.querySelector(selector)! : document.getElementById(id)!;
  const measured = getComputedStyle(el).getPropertyValue(prop);
  const same = measured === baseline;
  return {
    group: 'MUI styles with Tailwind Preflight (compare with baseline)',
    id,
    label,
    measured: `${prop}: ${measured}`,
    outcome: same ? 'Same as baseline' : `Changed (baseline: ${baseline})`,
    ok: same,
  };
}

export function measure(tailwind: boolean): Row[] {
  const vw = window.innerWidth;
  const g1 = 'Tailwind class vs MUI sx (Emotion)';
  const g2 = 'Tailwind class vs MUI component styles';
  const g3 = 'Tailwind class vs styled-components';
  const rows: Row[] = [
    classVsOther(g1, 'sx-width', 'Box sx={{ width: 300 }} + className="w-full" (wrapper is 500px)', 'width', '500px', 'Emotion', tailwind),
    classVsOther(g1, 'sx-width-important', 'Box sx={{ width: 300 }} + className="w-full!"', 'width', '500px', 'Emotion', tailwind),
    classVsOther(g2, 'paper-padding', 'Paper className="p-8" (MUI does not set padding)', 'padding-top', '32px', 'MUI', tailwind),
    classVsOther(g2, 'paper-radius', 'Paper className="rounded-none"', 'border-top-left-radius', '0px', 'MUI', tailwind),
    classVsOther(g2, 'button-padding', 'Button className="px-10"', 'padding-left', '40px', 'MUI', tailwind),
    classVsOther(g3, 'sc-width', 'styled.div`width: 300px` + className="w-full"', 'width', '500px', 'styled-components', tailwind),
    classVsOther(g3, 'sc-width-important', 'styled.div`width: 300px` + className="w-full!"', 'width', '500px', 'styled-components', tailwind),
  ];

  // Dialog rows: expected paper width is 586px at md and up, else the full width minus MUI's 32px margins
  const expectedPaper = vw >= MD_BREAKPOINT ? 586 : vw - 64;
  for (const [id, label] of [
    ['dialog-root-class', '<Dialog className="w-full md:w-146.5">'],
    ['dialog-paper-class', '<Dialog slotProps={{ paper: { className: "w-full md:w-146.5" } }}>'],
  ]) {
    const r = document.getElementById(`${id}-paper`)!.getBoundingClientRect();
    const width = num(String(r.width));
    const offset = num(String(r.left + r.width / 2 - vw / 2));
    const widthOk = Math.abs(width - expectedPaper) < 1;
    const centered = Math.abs(offset) < 1;
    rows.push({
      group: `Dialog paper width (expected ${expectedPaper}px at viewport ${vw}px, centered)`,
      id,
      label,
      measured: `paper width: ${width}px, offset from center: ${offset}px`,
      outcome: !tailwind ? 'Not applicable (no Tailwind)' : widthOk && centered ? 'Paper has the expected width and is centered' : `${widthOk ? '' : 'Paper width is not as expected. '}${centered ? '' : 'Paper is not centered.'}`.trim(),
      ok: tailwind ? widthOk && centered : null,
    });
  }

  // Baseline values come from the "baseline" page (no Tailwind)
  rows.push(
    muiUnchanged('mui-button', 'MUI contained Button padding', 'padding-left', '16px'),
    muiUnchanged('mui-button-bg', 'MUI contained Button background', 'background-color', MUI_BLUE, '#mui-button'),
    muiUnchanged('mui-h1', 'MUI Typography h1 font size', 'font-size', '96px'),
    muiUnchanged('mui-textfield', 'MUI TextField outline border', 'border-top-width', '1px', '#mui-textfield ~ fieldset'),
    muiUnchanged('mui-divider', 'MUI Divider border', 'border-bottom-width', '1px'),
  );
  return rows;
}
