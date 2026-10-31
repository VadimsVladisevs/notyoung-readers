import { SxProps, Theme } from '@mui/material';
import { RANDOM_BOOK_DIALOG_CONSTANTS } from './random-book-dialog.constants';

export const dialogTitleStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  pt: 2,
  pb: 2,
};

export const imageContainerStyles: SxProps<Theme> = {
  width: RANDOM_BOOK_DIALOG_CONSTANTS.IMAGE_WIDTH,
  height: RANDOM_BOOK_DIALOG_CONSTANTS.IMAGE_HEIGHT,
  overflow: 'hidden',
  mb: 3,
};

export const imageStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

export const titleStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  mb: 1,
};

export const actionsContainerStyles: SxProps<Theme> = {
  justifyContent: 'center',
  px: 3,
  pb: 3,
};

export const selectButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  px: 4,
};
