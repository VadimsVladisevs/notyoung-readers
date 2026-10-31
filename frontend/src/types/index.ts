export type BookStatus = 'new' | 'progress' | 'finished';

export interface Book {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  author: string;
  image: string;
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
  image: string;
  tag: string;
  wiki: string;
}

export interface BookDto {
  title?: string;
  author?: string;
  image?: string;
  tag?: string;
  wiki?: string;
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
