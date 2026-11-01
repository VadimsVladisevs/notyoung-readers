import { SxProps, Theme } from '@mui/material';

export const fabStyles: SxProps<Theme> = {
  position: 'fixed',
  bottom: { xs: 16, md: 24 },
  right: { xs: 16, md: 24 },
  zIndex: (theme) => theme.zIndex.speedDial,
};
