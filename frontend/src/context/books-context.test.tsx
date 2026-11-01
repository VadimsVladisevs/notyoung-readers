import { renderHook, waitFor } from '@testing-library/react';
import { BooksProvider, useBooksContext } from './books-context';
import { current, finishedHigh, finishedLow, newAnna, newBoris } from '../test/books';

describe('BooksProvider', () => {
  it('splits the books into new, current and finished (rating desc)', async () => {
    const { result } = renderHook(() => useBooksContext(), { wrapper: BooksProvider });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.newBooks.map((b) => b.id)).toEqual(expect.arrayContaining([newAnna.id, newBoris.id]));
    expect(result.current.newBooks).toHaveLength(2);
    expect(result.current.currentBook).toEqual(current);
    expect(result.current.finishedBooks).toEqual([finishedHigh, finishedLow]);
    expect(result.current.error).toBeNull();
  });
});
