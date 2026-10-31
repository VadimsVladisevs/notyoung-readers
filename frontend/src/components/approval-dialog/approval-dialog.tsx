import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Book } from '../../types';
import { t } from '../../i18n';
import { useApprovalDialog } from './approval-dialog.hooks';
import * as styles from './approval-dialog.styles';

export interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rating: number | null, password: string) => Promise<void>;
  currentBook: Book | null;
  newBook: Book | null;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentBook,
  newBook,
}) => {
  const {
    rating,
    password,
    error,
    loading,
    handleRatingChange,
    handlePasswordChange,
    handleConfirm,
    resetForm,
  } = useApprovalDialog(open, currentBook !== null, onConfirm);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!newBook) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={styles.dialogTitleStyles}>
        {t('dialogs.approval.title')}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={styles.contentContainerStyles}>
          {currentBook && (
            <Box>
              <Typography variant="body1" sx={styles.ratingLabelStyles}>
                {t('dialogs.approval.ratingLabel')}{' '}
                <strong>{currentBook.title}. {currentBook.author}</strong>:
              </Typography>
              <TextField
                fullWidth
                value={rating}
                onChange={handleRatingChange}
                size="small"
              />
            </Box>
          )}
          
          <TextField
            fullWidth
            type="password"
            label={t('dialogs.approval.passwordLabel')}
            value={password}
            onChange={handlePasswordChange}
            error={!!error}
          />

          {error && (
            <Alert severity="error">{error}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={styles.actionsContainerStyles}>
        <Button onClick={handleClose} color="inherit" sx={styles.cancelButtonStyles}>
          {t('dialogs.approval.cancelButton')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={loading}
          sx={styles.confirmButtonStyles}
        >
          {t('dialogs.approval.confirmButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDialog;
