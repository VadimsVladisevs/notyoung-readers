import { useState, useCallback } from 'react';
import { Book } from '../../types';

export const useBookSelectionDialog = (onSelectBook: (book: Book) => Promise<void>) => {
  const [randomDialogOpen, setRandomDialogOpen] = useState(false);
  const [randomBook, setRandomBook] = useState<Book | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  const handleToggleBookSelection = useCallback((book: Book) => {
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(book.id)) {
        newSet.delete(book.id);
      } else {
        newSet.add(book.id);
      }
      return newSet;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBooks(new Set());
  }, []);

  const handleOpenRandomDialog = useCallback(() => {
    setRandomDialogOpen(true);
  }, []);

  const handleCloseRandomDialog = useCallback(() => {
    setRandomDialogOpen(false);
    setRandomBook(null);
  }, []);

  const handleSetRandomBook = useCallback((book: Book) => {
    setRandomBook(book);
  }, []);

  const handleSelectRandomBook = useCallback(async () => {
    if (randomBook) {
      await onSelectBook(randomBook);
      handleCloseRandomDialog();
    }
  }, [randomBook, onSelectBook, handleCloseRandomDialog]);

  return {
    randomDialogOpen,
    randomBook,
    selectedBooks,
    handleToggleBookSelection,
    handleClearSelection,
    handleOpenRandomDialog,
    handleCloseRandomDialog,
    handleSetRandomBook,
    handleSelectRandomBook,
  };
};
