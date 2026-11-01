import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { t } from '../../i18n';
import { COVER_MAX_BYTES, COVER_TYPE } from '../../utils/cover';
import * as styles from './cover-drop-zone.styles';

export interface CoverDropZoneProps {
  /** The newly chosen file, or `null`. */
  file: File | null;
  /** Shown while no file is chosen, e.g. the book's current cover in the edit dialog. */
  currentSrc?: string;
  /** Called with a valid JPEG, or `null` when the chosen file is removed. */
  onChange: (file: File | null) => void;
}

/** Drop a JPEG cover onto it, or click (Enter / Space) to pick one. Checks type and size before `onChange`. */
const CoverDropZone: React.FC<CoverDropZoneProps> = ({ file, currentSrc, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (picked: File | undefined) => {
    if (!picked) return;
    if (picked.type !== COVER_TYPE) {
      setError(t('dialogs.cover.wrongType'));
      return;
    }
    if (picked.size > COVER_MAX_BYTES) {
      setError(t('dialogs.cover.tooLarge'));
      return;
    }
    setError(null);
    onChange(picked);
  };

  const openPicker = () => inputRef.current?.click();
  const src = preview ?? currentSrc;

  return (
    <Box>
      <Typography variant="body2" sx={styles.labelStyles}>{t('dialogs.cover.label')}</Typography>
      <Box
        role="button"
        tabIndex={0}
        aria-label={t('dialogs.cover.dropHint')}
        sx={styles.zoneStyles(dragging, error !== null)}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
      >
        {src && <Box component="img" src={src} alt={t('dialogs.cover.previewAlt')} sx={styles.previewStyles} />}
        <Typography variant="body2" color="text.secondary">{t('dialogs.cover.dropHint')}</Typography>
      </Box>
      {file && (
        <Button size="small" color="inherit" sx={styles.removeButtonStyles} onClick={() => onChange(null)}>
          {t('dialogs.cover.remove')}
        </Button>
      )}
      {error && <Typography variant="body2" color="error" role="alert" sx={styles.errorStyles}>{error}</Typography>}
      <input
        ref={inputRef}
        type="file"
        accept={COVER_TYPE}
        hidden
        aria-label={t('dialogs.cover.inputLabel')}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          // Lets the same file be picked again after removing it
          e.target.value = '';
        }}
      />
    </Box>
  );
};

export default CoverDropZone;
