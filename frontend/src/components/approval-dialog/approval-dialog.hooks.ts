import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';
import { ApiError } from '../../services/api';

/** The current book's rating as typed (comma or dot), or null unless it's within 1–10. */
export const parseRating = (value: string): number | null => {
  const rating = Number(value.replace(',', '.'));
  return value.trim() !== '' && rating >= 1 && rating <= 10 ? rating : null;
};

export const useApprovalDialog = (
  open: boolean,
  ratingRequired: boolean,
  onConfirm: (rating: number | null) => Promise<void>
) => {
  const [rating, setRating] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating('');
      setError(null);
    }
  }, [open]);

  const handleRatingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.');
    // Allow empty, or valid decimal pattern (1-10, with up to 2 decimal places)
    if (value === '' || /^([1-9](\.\d{0,2})?|10(\.0{0,2})?)$/.test(value) || /^[1-9]?\.$/.test(value)) {
      setRating(e.target.value);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    const ratingValue = parseRating(rating);
    if (ratingRequired && ratingValue === null) {
      setError(t('dialogs.approval.ratingRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(ratingValue);
      setRating('');
    } catch (err) {
      const sessionExpired = err instanceof ApiError && err.status === 401;
      setError(t(sessionExpired ? 'dialogs.approval.sessionExpired' : 'dialogs.approval.saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [rating, ratingRequired, onConfirm]);

  const resetForm = useCallback(() => {
    setRating('');
    setError(null);
  }, []);

  return {
    rating,
    error,
    loading,
    handleRatingChange,
    handleConfirm,
    resetForm,
  };
};
