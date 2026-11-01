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
  MenuItem,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { t } from '../../i18n';
import { Book, BookDto, BookStatus } from '../../types';
import CoverDropZone from '../cover-drop-zone';
import { coverSrc } from '../../utils/cover';
import { useEditBookDialog } from './edit-book-dialog.hooks';
import * as styles from './edit-book-dialog.styles';

const STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'new', label: t('dialogs.editBook.statusNew') },
  { value: 'progress', label: t('dialogs.editBook.statusProgress') },
  { value: 'finished', label: t('dialogs.editBook.statusFinished') },
];

export interface EditBookDialogProps {
  /** The book being edited; `null` closes the dialog. */
  book: Book | null;
  onClose: () => void;
  /**
   * Saves the edit, then uploads the cover if a new one was chosen. Throws `ApiError` on failure (401 session
   * gone, 409 another book in progress), or `CoverUploadError` when the edit was saved but the cover wasn't.
   */
  onSubmit: (book: BookDto, cover: File | null) => Promise<void>;
  /** Deletes the book; throws `ApiError` on failure. */
  onDelete: () => Promise<void>;
  /** Existing tags (club members), offered as suggestions. */
  tags: string[];
}

const EditBookDialog: React.FC<EditBookDialogProps> = ({ book, onClose, onSubmit, onDelete, tags }) => {
  const {
    values, missing, error, loading, confirmingDelete, setConfirmingDelete, cover, setCover, setField, handleSubmit,
    handleDelete,
  } = useEditBookDialog(book, onSubmit, onDelete);

  return (
    <Dialog open={book !== null} onClose={onClose} maxWidth="sm" fullWidth>
      {values && (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle sx={styles.dialogTitleStyles}>
            {t('dialogs.editBook.title')}
            <IconButton onClick={onClose} size="small" aria-label={t('dialogs.addBook.cancelButton')}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={styles.contentContainerStyles}>
              <TextField
                fullWidth
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
              <TextField
                select
                fullWidth
                label={t('dialogs.editBook.statusLabel')}
                value={values.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </TextField>
              {values.status === 'finished' && (
                <TextField
                  fullWidth
                  label={t('dialogs.editBook.ratingLabel')}
                  value={values.rating}
                  onChange={(e) => setField('rating', e.target.value)}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              )}
              <CoverDropZone
                file={cover}
                currentSrc={book?.image ? coverSrc(book) : undefined}
                onChange={setCover}
              />
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions sx={styles.actionsContainerStyles}>
            {confirmingDelete ? (
              <>
                <Typography variant="body2" sx={styles.confirmTextStyles}>
                  {t('dialogs.editBook.deleteConfirm')}
                </Typography>
                <Button onClick={() => setConfirmingDelete(false)} color="inherit" sx={styles.buttonStyles}>
                  {t('dialogs.editBook.deleteNo')}
                </Button>
                <Button onClick={handleDelete} variant="contained" color="error" disabled={loading} sx={styles.buttonStyles}>
                  {t('dialogs.editBook.deleteYes')}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setConfirmingDelete(true)} color="error" sx={styles.deleteButtonStyles}>
                  {t('dialogs.editBook.deleteButton')}
                </Button>
                <Button onClick={onClose} color="inherit" sx={styles.buttonStyles}>
                  {t('dialogs.addBook.cancelButton')}
                </Button>
                <Button type="submit" variant="contained" color="success" disabled={loading} sx={styles.buttonStyles}>
                  {t('dialogs.editBook.submitButton')}
                </Button>
              </>
            )}
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};

export default EditBookDialog;
