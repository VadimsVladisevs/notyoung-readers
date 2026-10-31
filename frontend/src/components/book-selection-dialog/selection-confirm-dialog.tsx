import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Book } from '../../types';
import { t } from '../../i18n';

export interface SelectionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  book: Book | null;
}

const SelectionConfirmDialog: React.FC<SelectionConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  book,
}) => {
  if (!book) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('dialogs.bookSelection.confirmTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', pt: 2 }}>
          <Box
            component="img"
            src={book.image}
            alt={book.title}
            sx={{ width: 150, height: 225, objectFit: 'cover', borderRadius: 1 }}
          />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {book.author}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              {book.tag}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" size="large">
          {t('dialogs.bookSelection.cancelButton')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="success" size="large">
          {t('dialogs.bookSelection.confirmButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectionConfirmDialog;
