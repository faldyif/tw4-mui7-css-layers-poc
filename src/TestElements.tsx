import { Box, Paper, Button, Dialog, DialogContent, TextField, Divider, Typography } from '@mui/material';
import styled from 'styled-components';

// styled-components element with a fixed width, to compare with a Tailwind class
const ScBox = styled.div`
  width: 300px;
  height: 10px;
  background: rgb(0, 0, 255);
`;

const dialogProps = { open: true, hideBackdrop: true, disableEnforceFocus: true, disableScrollLock: true } as const;

export function TestElements() {
  return (
    <div id="wrap" style={{ width: 500 }}>
      {/* Tailwind class vs MUI sx (Emotion) on the same property */}
      <Box id="sx-width" sx={{ width: 300, height: 10, bgcolor: 'rgb(0, 128, 0)' }} className="w-full" />
      <Box id="sx-width-important" sx={{ width: 300, height: 10, bgcolor: 'rgb(0, 128, 0)' }} className="w-full!" />

      {/* Tailwind class vs MUI component styles */}
      <Paper id="paper-padding" className="p-8">Paper p-8</Paper>
      <Paper id="paper-radius" className="rounded-none">Paper rounded-none</Paper>
      <Button id="button-padding" variant="contained" className="px-10">Button px-10</Button>

      {/* Tailwind class vs styled-components on the same property */}
      <ScBox id="sc-width" className="w-full" />
      <ScBox id="sc-width-important" className="w-full!" />

      {/* MUI components without Tailwind classes, to see Preflight effects */}
      <Button id="mui-button" variant="contained">MUI Button</Button>
      <Typography id="mui-h1" variant="h1">MUI h1</Typography>
      <TextField id="mui-textfield" label="Label" variant="outlined" />
      <Divider id="mui-divider" />

      {/* Dialog: className on the Dialog root vs on the paper */}
      <Dialog {...dialogProps} id="dialog-root-class" className="w-full md:w-146.5" slotProps={{ paper: { id: 'dialog-root-class-paper' } }}>
        <DialogContent>className on Dialog</DialogContent>
      </Dialog>
      <Dialog {...dialogProps} id="dialog-paper-class" slotProps={{ paper: { id: 'dialog-paper-class-paper', className: 'w-full md:w-146.5' } }}>
        <DialogContent>className on slotProps.paper</DialogContent>
      </Dialog>
    </div>
  );
}
