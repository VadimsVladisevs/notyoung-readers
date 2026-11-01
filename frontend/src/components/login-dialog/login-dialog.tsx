import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { t } from '../../i18n';
import { useLoginDialog } from './login-dialog.hooks';
import * as styles from './login-dialog.styles';

export interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const {
    username,
    password,
    error,
    loading,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
  } = useLoginDialog(open, onClose);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={styles.dialogTitleStyles}>
          {t('dialogs.login.title')}
          <IconButton onClick={onClose} size="small" aria-label={t('dialogs.login.cancelButton')}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={styles.contentContainerStyles}>
            <TextField
              fullWidth
              autoFocus
              label={t('dialogs.login.usernameLabel')}
              autoComplete="username"
              value={username}
              onChange={handleUsernameChange}
              error={!!error}
            />
            <TextField
              fullWidth
              type="password"
              label={t('dialogs.login.passwordLabel')}
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              error={!!error}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={styles.actionsContainerStyles}>
          <Button onClick={onClose} color="inherit" sx={styles.buttonStyles}>
            {t('dialogs.login.cancelButton')}
          </Button>
          <Button type="submit" variant="contained" color="success" disabled={loading} sx={styles.buttonStyles}>
            {t('dialogs.login.submitButton')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default LoginDialog;
