import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';
import { ApiError } from '../../services/api';
import { CreateBookDto } from '../../types';

type Field = 'title' | 'author' | 'tag' | 'wiki';

const EMPTY: Record<Field, string> = { title: '', author: '', tag: '', wiki: '' };

export const useAddBookDialog = (
  open: boolean,
  onSubmit: (book: CreateBookDto) => Promise<void>
) => {
  const [values, setValues] = useState(EMPTY);
  const [missing, setMissing] = useState<Set<Field>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(EMPTY);
      setMissing(new Set());
      setError(null);
    }
  }, [open]);

  const setField = useCallback((field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Same rules as the backend: every field required and not blank (no cover until Phase 10).
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
      });
    } catch (err) {
      const sessionExpired = err instanceof ApiError && err.status === 401;
      setError(t(sessionExpired ? 'dialogs.addBook.sessionExpired' : 'dialogs.addBook.saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [values, onSubmit]);

  return {
    values,
    missing,
    error,
    loading,
    setField,
    handleSubmit,
  };
};
