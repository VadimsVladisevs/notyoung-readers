import { SxProps, Theme } from '@mui/material';

export const dialogTitleStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: 2,
  py: 1,
};

export const titleTextStyles: SxProps<Theme> = {
  flex: 1,
  textAlign: 'center',
  fontWeight: 'bold',
};

export const modeButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  minWidth: 120,
};

export const dialogContentStyles: SxProps<Theme> = {
  pt: 2,
  px: 2,
};

export const chartContainerStyles: SxProps<Theme> = {
  height: 400,
  minHeight: 300,
};

export const dialogActionsStyles: SxProps<Theme> = {
  justifyContent: 'flex-end',
  px: 2,
  pb: 2,
};

export const closeButtonStyles: SxProps<Theme> = {
  minWidth: 'auto',
  p: 0.5,
};

export const closeTextButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};
