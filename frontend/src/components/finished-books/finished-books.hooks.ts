import { useCallback, useState } from 'react';
import { FINISHED_BOOKS_CONSTANTS } from './finished-books.constants';

/** How many finished books are shown; «Показать ещё» adds a page. */
export const useFinishedBooks = (total: number) => {
  const [visible, setVisible] = useState<number>(FINISHED_BOOKS_CONSTANTS.PAGE_SIZE);

  const showMore = useCallback(() => {
    setVisible((prev) => prev + FINISHED_BOOKS_CONSTANTS.PAGE_SIZE);
  }, []);

  return { visible, hasMore: total > visible, showMore };
};
