import { useState, useCallback } from 'react';
import { useBooksContext } from '../../context/books-context';
import { Book } from '../../types';
import * as api from '../../services/api';

export const useHomePage = () => {
  const {
    allBooks,
    newBooks,
    currentBook,
    finishedBooks,
    loading,
    refreshBooks,
  } = useBooksContext();

  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [statisticsDialogOpen, setStatisticsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pendingNewBook, setPendingNewBook] = useState<Book | null>(null);

  const handleOpenSelectionDialog = useCallback(() => {
    setSelectionDialogOpen(true);
  }, []);

  const handleCloseSelectionDialog = useCallback(() => {
    setSelectionDialogOpen(false);
  }, []);

  // Always goes through the approval dialog: every write needs the club password.
  // With no current book the dialog asks only for the password (not used by the club today).
  const handleSelectBook = useCallback(async (book: Book) => {
    setPendingNewBook(book);
    setApprovalDialogOpen(true);
  }, []);

  const handleCloseApprovalDialog = useCallback(() => {
    setApprovalDialogOpen(false);
    setPendingNewBook(null);
  }, []);

  const handleApprovalConfirm = useCallback(async (rating: number | null, password: string) => {
    if (!pendingNewBook) return;
    if (!(await api.checkPassword(password))) {
      throw new api.ApiError(401);
    }

    try {
      if (currentBook && rating !== null) {
        await api.finishBook(currentBook.id, rating, password);
      }
      await api.startBook(pendingNewBook.id, password);
    } finally {
      // Refresh even after a failure: finish may have worked when start didn't.
      await refreshBooks();
    }
    setApprovalDialogOpen(false);
    setSelectionDialogOpen(false);
    setPendingNewBook(null);
  }, [currentBook, pendingNewBook, refreshBooks]);

  const handleGetRandomBook = useCallback(async () => {
    return await api.getRandomBook();
  }, []);

  const handleOpenStatistics = useCallback(() => {
    setStatisticsDialogOpen(true);
  }, []);

  const handleCloseStatistics = useCallback(() => {
    setStatisticsDialogOpen(false);
  }, []);

  return {
    allBooks,
    newBooks,
    currentBook,
    finishedBooks,
    loading,
    selectionDialogOpen,
    statisticsDialogOpen,
    approvalDialogOpen,
    pendingNewBook,
    handleOpenSelectionDialog,
    handleCloseSelectionDialog,
    handleSelectBook,
    handleCloseApprovalDialog,
    handleApprovalConfirm,
    handleGetRandomBook,
    handleOpenStatistics,
    handleCloseStatistics,
  };
};
