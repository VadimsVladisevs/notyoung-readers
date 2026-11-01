import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';
import { ApiError } from '../../services/api';
import { CreateBookDto } from '../../types';
import { CoverUploadError } from '../../utils/cover';

type Field = 'title' | 'author' | 'tag' | 'wiki';

const EMPTY: Record<Field, string> = { title: '', author: '', tag: '', wiki: '' };

export const useAddBookDialog = (
  open: boolean,
  onSubmit: (book: CreateBookDto, cover: File | null) => Promise<void>
) => {
  const [values, setValues] = useState(EMPTY);
  const [missing, setMissing] = useState<Set<Field>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  // The book exists but its cover upload failed: submitting again would add it twice.
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(EMPTY);
      setMissing(new Set());
      setError(null);
      setCover(null);
      setSaved(false);
    }
  }, [open]);

  const setField = useCallback((field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Same rules as the backend: every text field required and not blank; the cover is optional.
    const blank = new Set((Object.keys(values) as Field[]).filter((f) => !values[f].trim()));
    setMissing(blank);
    if (blank.size > 0) {
      setError(t('dialogs.addBook.required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        title: values.title.trim(),
        author: values.author.trim(),
        tag: values.tag.trim(),
        wiki: values.wiki.trim(),
      }, cover);
    } catch (err) {
      if (err instanceof CoverUploadError) {
        setSaved(true);
        setError(t('dialogs.cover.uploadFailedAdd'));
        return;
      }
      const sessionExpired = err instanceof ApiError && err.status === 401;
      setError(t(sessionExpired ? 'dialogs.addBook.sessionExpired' : 'dialogs.addBook.saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [values, cover, onSubmit]);

  return {
    values,
    missing,
    error,
    loading,
    saved,
    cover,
    setCover,
    setField,
    handleSubmit,
  };
};
