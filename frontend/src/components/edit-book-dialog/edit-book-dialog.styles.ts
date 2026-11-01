import { SxProps, Theme } from '@mui/material';

// Same layout as the add-book dialog.
export {
  dialogTitleStyles,
  contentContainerStyles,
  actionsContainerStyles,
  buttonStyles,
} from '../add-book-dialog/add-book-dialog.styles';

// Pushes «Удалить» to the left, away from «Сохранить».
export const deleteButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  mr: 'auto',
};

export const confirmTextStyles: SxProps<Theme> = {
  mr: 'auto',
};
