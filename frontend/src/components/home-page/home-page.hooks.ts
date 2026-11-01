import { useState, useCallback } from 'react';
import { useBooksContext } from '../../context/books-context';
import { useAuthContext } from '../../context/auth-context';
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
  const { user, isAdmin, logout, sessionExpired } = useAuthContext();

  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [statisticsDialogOpen, setStatisticsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pendingNewBook, setPendingNewBook] = useState<Book | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleOpenSelectionDialog = useCallback(() => {
    setSelectionDialogOpen(true);
  }, []);

  const handleCloseSelectionDialog = useCallback(() => {
    setSelectionDialogOpen(false);
  }, []);

  // Always goes through the approval dialog (the rating for the current book).
  const handleSelectBook = useCallback(async (book: Book) => {
    setPendingNewBook(book);
    setApprovalDialogOpen(true);
  }, []);

  const handleCloseApprovalDialog = useCallback(() => {
    setApprovalDialogOpen(false);
    setPendingNewBook(null);
  }, []);

  const handleApprovalConfirm = useCallback(async (rating: number | null) => {
    if (!pendingNewBook) return;

    try {
      if (currentBook && rating !== null) {
        await api.finishBook(currentBook.id, rating);
      }
      await api.startBook(pendingNewBook.id);
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) {
        sessionExpired();
      }
      throw err;
    } finally {
      // Refresh even after a failure: finish may have worked when start didn't.
      await refreshBooks();
    }
    setApprovalDialogOpen(false);
    setSelectionDialogOpen(false);
    setPendingNewBook(null);
  }, [currentBook, pendingNewBook, refreshBooks, sessionExpired]);

  const handleGetRandomBook = useCallback(async () => {
    return await api.getRandomBook();
  }, []);

  const handleOpenStatistics = useCallback(() => {
    setStatisticsDialogOpen(true);
  }, []);

  const handleCloseStatistics = useCallback(() => {
    setStatisticsDialogOpen(false);
  }, []);

  const handleOpenLoginDialog = useCallback(() => {
    setLoginDialogOpen(true);
  }, []);

  const handleCloseLoginDialog = useCallback(() => {
    setLoginDialogOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    setSelectionDialogOpen(false);
    await logout();
  }, [logout]);

  return {
    allBooks,
    newBooks,
    currentBook,
    finishedBooks,
    loading,
    loggedIn: user !== null,
    canSelectBook: isAdmin,
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
    loginDialogOpen,
    handleOpenLoginDialog,
    handleCloseLoginDialog,
    handleLogout,
  };
};
