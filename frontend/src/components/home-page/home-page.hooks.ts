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

  const handleSelectBook = useCallback(async (book: Book) => {
    // If there's a current book, we need approval with rating and password
    if (currentBook) {
      setPendingNewBook(book);
      setApprovalDialogOpen(true);
    } else {
      // No current book, just start the new one
      await api.startBook(book.id);
      await refreshBooks();
      setSelectionDialogOpen(false);
    }
  }, [currentBook, refreshBooks]);

  const handleCloseApprovalDialog = useCallback(() => {
    setApprovalDialogOpen(false);
    setPendingNewBook(null);
  }, []);

  const handleApprovalConfirm = useCallback(async (rating: number, password: string) => {
    const checkResult = await api.checkPassword(password);
    if (!checkResult.result) {
      throw new Error('Wrong password');
    }

    if (currentBook && pendingNewBook) {
      await api.finishBook(currentBook.id, rating);
      await api.startBook(pendingNewBook.id);
      await refreshBooks();
      setApprovalDialogOpen(false);
      setSelectionDialogOpen(false);
      setPendingNewBook(null);
    }
  }, [currentBook, pendingNewBook, refreshBooks]);

  const handleFinishBook = useCallback(async (bookId: string, rating?: number | null) => {
    await api.finishBook(bookId, rating ?? undefined);
    await refreshBooks();
  }, [refreshBooks]);

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
    handleFinishBook,
    handleGetRandomBook,
    handleOpenStatistics,
    handleCloseStatistics,
  };
};
