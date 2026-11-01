import { SxProps, Theme } from '@mui/material';

export const mainContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

export const contentBoxStyles: SxProps<Theme> = {
  flexGrow: 1,
  // Clears the fixed navbar above the first section.
  pt: { xs: 8, md: 10 },
};

export const dividerStyles: SxProps<Theme> = {
  my: { xs: '1.5rem', md: '2rem' },
  mx: 'auto',
  width: '80%',
  maxWidth: '1200px',
};

export const backdropStyles: SxProps<Theme> = {
  color: '#fff',
  zIndex: (theme) => theme.zIndex.drawer + 1,
};
