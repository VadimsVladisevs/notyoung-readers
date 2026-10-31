export const API_BASE = '/api';

export const API_ROUTES = {
  BOOKS: `${API_BASE}/books`,
  BOOKS_BY_ID: (id: string) => `${API_BASE}/books/${id}`,
  BOOKS_BY_STATUS: (status: string) => `${API_BASE}/books?status=${status}`,
  BOOKS_ADD: `${API_BASE}/books/add`,
  BOOKS_UPDATE: (id: string) => `${API_BASE}/books/${id}/update`,
  BOOKS_FINISH: (id: string) => `${API_BASE}/books/${id}/finish`,
  BOOKS_START: (id: string) => `${API_BASE}/books/${id}/start`,
  BOOKS_RANDOM: `${API_BASE}/books/random`,
  BOOKS_RANDOM_WITH_IDS: (booksId: string[]) => 
    `${API_BASE}/books/random?${booksId.map(id => `booksId=${id}`).join('&')}`,
  STATISTICS: `${API_BASE}/statistics`,
  CHECK_PASSWORD: `${API_BASE}/check-password`,
} as const;

