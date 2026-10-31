import { SxProps, Theme } from '@mui/material';

export const mainContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

export const contentBoxStyles: SxProps<Theme> = {
  flexGrow: 1,
};

export const dividerStyles: SxProps<Theme> = {
  my: '2rem',
  mx: 'auto',
  width: '80%',
  maxWidth: '1200px',
};

export const backdropStyles: SxProps<Theme> = {
  color: '#fff',
  zIndex: (theme) => theme.zIndex.drawer + 1,
};
