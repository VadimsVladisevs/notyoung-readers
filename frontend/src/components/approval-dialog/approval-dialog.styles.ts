import { SxProps, Theme } from '@mui/material';

export const dialogTitleStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  pt: 2,
};

export const ratingLabelStyles: SxProps<Theme> = {
  mb: 1,
};

export const actionsContainerStyles: SxProps<Theme> = {
  px: 3,
  pb: 3,
};

export const cancelButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};

export const confirmButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};
