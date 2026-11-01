import { useMemo, useState } from 'react';
import { Book, BookStatus } from '../../types';

export type LibraryFilter = 'all' | BookStatus;

/** Lower case, «ё» as «е», so «ежик» finds «Ёжик». */
const normalize = (text: string) => text.toLowerCase().replace(/ё/g, 'е');

/** The library's search text and status filter, and the books that match both. */
export const useLibrarySwiper = (books: Book[]) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const filteredBooks = useMemo(() => {
    const words = normalize(query.trim());
    return books.filter((book) =>
      (filter === 'all' || book.status === filter)
      && (!words || [book.title, book.author, book.tag].some((field) => normalize(field ?? '').includes(words))));
  }, [books, query, filter]);

  return { query, setQuery, filter, setFilter, filteredBooks };
};
