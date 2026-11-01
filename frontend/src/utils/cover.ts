import { Book } from '../types';

/** Shown for books without a cover (cover upload comes in Phase 10). */
export const COVER_PLACEHOLDER = 'cover-placeholder.svg';

export const coverSrc = (book: Pick<Book, 'image'>): string => book.image || COVER_PLACEHOLDER;
