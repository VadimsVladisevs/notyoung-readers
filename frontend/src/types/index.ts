export type BookStatus = 'new' | 'progress' | 'finished';

export interface Book {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  author: string;
  /** Missing on books added without a cover (until Phase 10 upload). */
  image?: string;
  status: BookStatus;
  tag: string;
  wiki: string;
  rating?: number;
}

export interface Statistics {
  statistics: Record<string, number>;
}

export interface CreateBookDto {
  title: string;
  author: string;
  image?: string;
  tag: string;
  wiki: string;
}

/** Full edit of a book; the cover can't be changed here (upload comes in Phase 10). */
export interface BookDto {
  title: string;
  author: string;
  tag: string;
  wiki: string;
  status: BookStatus;
  /** Required for `finished`; left out for any other status. */
  rating?: number;
}

export interface FinishBookDto {
  rating: number;
}

export interface TagStatistics {
  tag: string;
  count: number;
  totalRating: number;
  averageRating: number;
  books: {
    author: string;
    title: string;
    rating?: number;
  }[];
}

/** The logged-in user from `/api/auth/me` and `/api/auth/login`. */
export interface CurrentUser {
  username: string;
  roles: string[];
}
