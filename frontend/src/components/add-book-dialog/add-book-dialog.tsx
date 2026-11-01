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
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { t } from '../../i18n';
import { CreateBookDto } from '../../types';
import CoverDropZone from '../cover-drop-zone';
import { useAddBookDialog } from './add-book-dialog.hooks';
import * as styles from './add-book-dialog.styles';

export interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Saves the book, then uploads the cover if one was chosen. Throws `ApiError` on failure (401 when the
   * session is gone), or `CoverUploadError` when the book was added but the cover wasn't.
   */
  onSubmit: (book: CreateBookDto, cover: File | null) => Promise<void>;
  /** Existing tags (club members), offered as suggestions. */
  tags: string[];
}

const AddBookDialog: React.FC<AddBookDialogProps> = ({ open, onClose, onSubmit, tags }) => {
  const {
    values, missing, error, loading, saved, cover, setCover, setField, handleSubmit,
  } = useAddBookDialog(open, onSubmit);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={styles.dialogTitleStyles}>
          {t('dialogs.addBook.title')}
          <IconButton onClick={onClose} size="small" aria-label={t('dialogs.addBook.cancelButton')}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={styles.contentContainerStyles}>
            <TextField
              fullWidth
              autoFocus
              label={t('dialogs.addBook.titleLabel')}
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              error={missing.has('title')}
            />
            <TextField
              fullWidth
              label={t('dialogs.addBook.authorLabel')}
              value={values.author}
              onChange={(e) => setField('author', e.target.value)}
              error={missing.has('author')}
            />
            <Autocomplete
              freeSolo
              options={tags}
              inputValue={values.tag}
              onInputChange={(_, value) => setField('tag', value)}
              renderInput={(params) => (
                <TextField {...params} label={t('dialogs.addBook.tagLabel')} error={missing.has('tag')} />
              )}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={t('dialogs.addBook.wikiLabel')}
              value={values.wiki}
              onChange={(e) => setField('wiki', e.target.value)}
              error={missing.has('wiki')}
            />
            <CoverDropZone file={cover} onChange={setCover} />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={styles.actionsContainerStyles}>
          <Button onClick={onClose} color="inherit" sx={styles.buttonStyles}>
            {t('dialogs.addBook.cancelButton')}
          </Button>
          <Button type="submit" variant="contained" color="success" disabled={loading || saved} sx={styles.buttonStyles}>
            {t('dialogs.addBook.submitButton')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddBookDialog;
