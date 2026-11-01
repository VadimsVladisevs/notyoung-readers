import { Book } from '../types';

/** Shown for books without a cover. */
export const COVER_PLACEHOLDER = 'cover-placeholder.svg';

/** What the backend accepts as a cover (`PUT /api/books/{id}/cover`). */
export const COVER_TYPE = 'image/jpeg';
export const COVER_MAX_BYTES = 2 * 1024 * 1024;

/**
 * The cover URL, or the placeholder. A re-uploaded cover can keep its name, so `?v=<updatedAt>` (which an
 * upload changes) makes the browser load the new one without a page reload.
 */
export const coverSrc = (book: Pick<Book, 'image' | 'updatedAt'>): string => {
  if (!book.image) return COVER_PLACEHOLDER;
  return book.updatedAt ? `${book.image}?v=${encodeURIComponent(book.updatedAt)}` : book.image;
};

/** The book was saved, but uploading its cover failed. */
export class CoverUploadError extends Error {
  constructor() {
    super('Cover upload failed');
    this.name = 'CoverUploadError';
  }
}
