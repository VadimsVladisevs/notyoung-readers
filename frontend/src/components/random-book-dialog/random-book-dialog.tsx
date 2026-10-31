import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Book } from '../../types';
import { t } from '../../i18n';
import * as styles from './random-book-dialog.styles';

export interface RandomBookDialogProps {
  open: boolean;
  onClose: () => void;
  book: Book | null;
  onSelectBook: () => void;
  onGetNewRandom: () => void;
}

const RandomBookDialog: React.FC<RandomBookDialogProps> = ({
  open,
  onClose,
  book,
  onSelectBook,
  onGetNewRandom,
}) => {
  if (!book) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={styles.dialogTitleStyles}>
        {t('dialogs.randomBook.title')}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={styles.contentContainerStyles}>
          <Box sx={styles.imageContainerStyles}>
            <Box
              component="img"
              src={book.image}
              alt={book.title}
              sx={styles.imageStyles}
            />
          </Box>
          <Typography variant="h5" sx={styles.titleStyles}>
            {book.title}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {book.author}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={styles.actionsContainerStyles}>
        <Button onClick={onSelectBook} variant="contained" color="primary" size="large" sx={styles.selectButtonStyles}>
          {t('dialogs.randomBook.selectButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RandomBookDialog;
