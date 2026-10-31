import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Book } from '../types';
import * as api from '../services/api';

interface BooksContextType {
  allBooks: Book[];
  newBooks: Book[];
  currentBook: Book | null;
  finishedBooks: Book[];
  loading: boolean;
  error: string | null;
  refreshBooks: () => Promise<void>;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

interface BooksProviderProps {
  children: ReactNode;
}

export const BooksProvider: React.FC<BooksProviderProps> = ({ children }) => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const books = await api.getBooks();
      const sortedBooks = books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setAllBooks(sortedBooks);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const newBooks = allBooks.filter(book => book.status === 'new');
  const currentBook = allBooks.find(book => book.status === 'progress') || null;
  const finishedBooks = allBooks.filter(book => book.status === 'finished');

  const refreshBooks = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  const value: BooksContextType = {
    allBooks,
    newBooks,
    currentBook,
    finishedBooks,
    loading,
    error,
    refreshBooks,
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
};

export const useBooksContext = (): BooksContextType => {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooksContext must be used within a BooksProvider');
  }
  return context;
};

export default BooksContext;
