import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';

export const useApprovalDialog = (
  open: boolean,
  onConfirm: (rating: number, password: string) => Promise<void>
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
    if (!password) {
      setError(t('dialogs.approval.passwordRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ratingValue = parseFloat(rating.replace(',', '.')) || 0;
      await onConfirm(ratingValue, password);
      setRating('');
      setPassword('');
    } catch (err) {
      setError(t('dialogs.approval.wrongPassword'));
    } finally {
      setLoading(false);
    }
  }, [password, rating, onConfirm]);

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
