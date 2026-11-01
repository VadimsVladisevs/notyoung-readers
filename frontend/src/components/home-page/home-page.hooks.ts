import { useState, useCallback } from 'react';
import { useBooksContext } from '../../context/books-context';
import { useAuthContext } from '../../context/auth-context';
import { Book, BookDto, CreateBookDto } from '../../types';
import * as api from '../../services/api';
import { CoverUploadError } from '../../utils/cover';

/** Uploads the cover of a saved book. A 401 stays an `ApiError`; any other failure becomes `CoverUploadError`. */
const uploadCover = async (id: string, cover: File) => {
  try {
    await api.uploadCover(id, cover);
  } catch (err) {
    throw err instanceof api.ApiError && err.status === 401 ? err : new CoverUploadError();
  }
};

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
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

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

  const handleOpenAddBookDialog = useCallback(() => {
    setAddBookDialogOpen(true);
  }, []);

  const handleCloseAddBookDialog = useCallback(() => {
    setAddBookDialogOpen(false);
  }, []);

  const handleAddBook = useCallback(async (book: CreateBookDto, cover: File | null) => {
    try {
      const added = await api.addBook(book);
      if (cover) {
        await uploadCover(added.id, cover);
      }
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) {
        sessionExpired();
      }
      if (err instanceof CoverUploadError) {
        // The book was added; show it
        await refreshBooks();
      }
      throw err;
    }
    await refreshBooks();
    setAddBookDialogOpen(false);
  }, [refreshBooks, sessionExpired]);

  const handleOpenEditBook = useCallback((book: Book) => {
    setEditingBook(book);
  }, []);

  const handleCloseEditBook = useCallback(() => {
    setEditingBook(null);
  }, []);

  // Runs an edit or delete of the open book, then refreshes and closes; a 401 logs the user out.
  const writeEditingBook = useCallback(async (write: (id: string) => Promise<unknown>) => {
    if (!editingBook) return;
    try {
      await write(editingBook.id);
    } catch (err) {
      if (err instanceof api.ApiError && err.status === 401) {
        sessionExpired();
      }
      if (err instanceof CoverUploadError) {
        // The edit was saved; show it
        await refreshBooks();
      }
      throw err;
    }
    await refreshBooks();
    setEditingBook(null);
  }, [editingBook, refreshBooks, sessionExpired]);

  const handleEditBook = useCallback(
    (book: BookDto, cover: File | null) => writeEditingBook(async (id) => {
      await api.editBook(id, book);
      if (cover) {
        await uploadCover(id, cover);
      }
    }),
    [writeEditingBook]
  );

  const handleDeleteBook = useCallback(
    () => writeEditingBook((id) => api.deleteBook(id)),
    [writeEditingBook]
  );

  // Distinct tags (club members) for the add-book and edit-book suggestions.
  const tags = [...new Set(allBooks.map((book) => book.tag).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const handleLogout = useCallback(async () => {
    setSelectionDialogOpen(false);
    setAddBookDialogOpen(false);
    setEditingBook(null);
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
    addBookDialogOpen,
    handleOpenAddBookDialog,
    handleCloseAddBookDialog,
    handleAddBook,
    editingBook,
    handleOpenEditBook,
    handleCloseEditBook,
    handleEditBook,
    handleDeleteBook,
    tags,
    handleLogout,
  };
};
