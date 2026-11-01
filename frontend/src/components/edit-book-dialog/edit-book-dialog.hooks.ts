import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';
import { ApiError } from '../../services/api';
import { Book, BookDto, BookStatus } from '../../types';
import { parseRating } from '../approval-dialog/approval-dialog.hooks';
import { CoverUploadError } from '../../utils/cover';

type TextField = 'title' | 'author' | 'tag' | 'wiki';
const TEXT_FIELDS: TextField[] = ['title', 'author', 'tag', 'wiki'];

interface Values extends Record<TextField, string> {
  status: BookStatus;
  rating: string;
}

const fromBook = (book: Book): Values => ({
  title: book.title,
  author: book.author,
  tag: book.tag,
  wiki: book.wiki ?? '',
  status: book.status,
  rating: book.rating?.toString() ?? '',
});

const errorMessage = (err: unknown): string => {
  if (err instanceof CoverUploadError) return t('dialogs.cover.uploadFailedEdit');
  const status = err instanceof ApiError ? err.status : undefined;
  if (status === 401) return t('dialogs.addBook.sessionExpired');
  if (status === 409) return t('dialogs.editBook.inProgressConflict');
  return t('dialogs.addBook.saveFailed');
};

export const useEditBookDialog = (
  book: Book | null,
  onSubmit: (book: BookDto, cover: File | null) => Promise<void>,
  onDelete: () => Promise<void>
) => {
  const [values, setValues] = useState<Values | null>(null);
  const [missing, setMissing] = useState<Set<TextField>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [cover, setCover] = useState<File | null>(null);

  // Fill the form when a book is opened; keep the values while the dialog closes.
  useEffect(() => {
    if (book) {
      setValues(fromBook(book));
      setMissing(new Set());
      setError(null);
      setConfirmingDelete(false);
      setCover(null);
    }
  }, [book]);

  const setField = useCallback((field: keyof Values, value: string) => {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const run = useCallback(async (call: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await call();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values) return;

    // Same rules as the backend: text fields not blank, a 1–10 rating for a finished book.
    const blank = new Set(TEXT_FIELDS.filter((f) => !values[f].trim()));
    setMissing(blank);
    if (blank.size > 0) {
      setError(t('dialogs.addBook.required'));
      return;
    }
    const finished = values.status === 'finished';
    const rating = parseRating(values.rating);
    if (finished && rating === null) {
      setError(t('dialogs.editBook.ratingRequired'));
      return;
    }

    await run(() => onSubmit({
      title: values.title.trim(),
      author: values.author.trim(),
      tag: values.tag.trim(),
      wiki: values.wiki.trim(),
      status: values.status,
      ...(finished && rating !== null ? { rating } : {}),
    }, cover));
  }, [values, cover, onSubmit, run]);

  const handleDelete = useCallback(() => run(onDelete), [onDelete, run]);

  return {
    values,
    missing,
    error,
    loading,
    confirmingDelete,
    setConfirmingDelete,
    cover,
    setCover,
    setField,
    handleSubmit,
    handleDelete,
  };
};
