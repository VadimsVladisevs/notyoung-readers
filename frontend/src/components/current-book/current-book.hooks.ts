import { useState, useCallback } from 'react';

export const useCurrentBook = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleOpenConfirmDialog = useCallback(() => {
    setConfirmDialogOpen(true);
  }, []);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialogOpen(false);
  }, []);

  const handleWikiClick = useCallback((wikiUrl: string | undefined) => {
    if (wikiUrl) {
      window.open(wikiUrl, '_blank');
    }
  }, []);

  return {
    confirmDialogOpen,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleWikiClick,
  };
};
