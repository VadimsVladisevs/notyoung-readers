import { SxProps, Theme } from '@mui/material';

export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  pt: 2,
};

export const ratingLabelStyles: SxProps<Theme> = {
  fontWeight: 'bold',
};

export const actionsContainerStyles: SxProps<Theme> = {
  justifyContent: 'flex-end',
  gap: 1,
  px: 2,
  pb: 2,
};

export const cancelButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};

export const confirmButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};
