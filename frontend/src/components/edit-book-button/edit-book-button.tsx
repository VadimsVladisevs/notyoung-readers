import React from 'react';
import { IconButton, SxProps, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { t } from '../../i18n';
import { Book } from '../../types';

export interface EditBookButtonProps {
  book: Book;
  onEdit: (book: Book) => void;
  sx?: SxProps<Theme>;
}

/** The admin's pencil on a book; opens the edit dialog. */
const EditBookButton: React.FC<EditBookButtonProps> = ({ book, onEdit, sx }) => (
  <IconButton
    size="small"
    aria-label={t('dialogs.editBook.openButton', { title: book.title })}
    onClick={() => onEdit(book)}
    sx={sx}
  >
    <EditIcon fontSize="small" />
  </IconButton>
);

export default EditBookButton;
