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
  onConfirm: (rating: number | null, password: string) => Promise<void>
) => {
  const [rating, setRating] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating('');
      setPassword('');
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

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleConfirm = useCallback(async () => {
    const ratingValue = parseRating(rating);
    if (ratingRequired && ratingValue === null) {
      setError(t('dialogs.approval.ratingRequired'));
      return;
    }
    if (!password) {
      setError(t('dialogs.approval.passwordRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(ratingValue, password);
      setRating('');
      setPassword('');
    } catch (err) {
      const wrongPassword = err instanceof ApiError && err.status === 401;
      setError(t(wrongPassword ? 'dialogs.approval.wrongPassword' : 'dialogs.approval.saveFailed'));
    } finally {
      setLoading(false);
    }
  }, [password, rating, ratingRequired, onConfirm]);

  const resetForm = useCallback(() => {
    setRating('');
    setPassword('');
    setError(null);
  }, []);

  return {
    rating,
    password,
    error,
    loading,
    handleRatingChange,
    handlePasswordChange,
    handleConfirm,
    resetForm,
  };
};
