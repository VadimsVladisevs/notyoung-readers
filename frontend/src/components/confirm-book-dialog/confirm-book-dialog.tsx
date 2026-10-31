import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Rating,
} from '@mui/material';
import { Book } from '../../types';
import { t } from '../../i18n';
import { CONFIRM_BOOK_DIALOG_CONSTANTS } from './confirm-book-dialog.constants';
import { useConfirmBookDialog } from './confirm-book-dialog.hooks';
import * as styles from './confirm-book-dialog.styles';

export interface ConfirmBookDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rating: number | null) => void;
  book: Book | null;
}

const ConfirmBookDialog: React.FC<ConfirmBookDialogProps> = ({
  open,
  onClose,
  onConfirm,
  book,
}) => {
  const { rating, handleRatingChange } = useConfirmBookDialog(open);

  if (!book) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('dialogs.confirmBook.title')}</DialogTitle>
      <DialogContent>
        <Box sx={styles.contentContainerStyles}>
          <Typography>
            {t('dialogs.confirmBook.message', { title: book.title })}
          </Typography>
          <Typography sx={styles.ratingLabelStyles}>
            {t('dialogs.confirmBook.ratingLabel')}
          </Typography>
          <Rating
            value={rating}
            onChange={handleRatingChange}
            max={CONFIRM_BOOK_DIALOG_CONSTANTS.MAX_RATING}
            precision={CONFIRM_BOOK_DIALOG_CONSTANTS.RATING_PRECISION}
            size="large"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={styles.actionsContainerStyles}>
        <Button onClick={onClose} sx={styles.cancelButtonStyles}>
          {t('dialogs.confirmBook.cancelButton')}
        </Button>
        <Button
          onClick={() => onConfirm(rating)}
          variant="contained"
          color="success"
          sx={styles.confirmButtonStyles}
        >
          {t('dialogs.confirmBook.confirmButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmBookDialog;
