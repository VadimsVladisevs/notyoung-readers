import { useState, useCallback, useEffect } from 'react';

export const useConfirmBookDialog = (open: boolean) => {
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setRating(null);
    }
  }, [open]);

  const handleRatingChange = useCallback((_event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue);
  }, []);

  return {
    rating,
    handleRatingChange,
  };
};
