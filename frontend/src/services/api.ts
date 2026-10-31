import { Book, Statistics, CreateBookDto, BookDto, FinishBookDto } from '../types';
import { API_ROUTES } from '../routes';

export const PASSWORD_HEADER = 'X-Club-Password';

/** A non-2xx response. `detail` comes from the backend's ProblemDetail body, if any. */
export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail?: string) {
    super(detail ?? `HTTP error! status: ${status}`);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(url: string, options?: RequestInit, password?: string): Promise<T> {
    const headers = new Headers(options?.headers);
    if (options?.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (password !== undefined) {
      headers.set(PASSWORD_HEADER, password);
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();

    if (!response.ok) {
      let detail: string | undefined;
      try {
        detail = JSON.parse(text).detail;
      } catch {
        // not a ProblemDetail body
      }
      throw new ApiError(response.status, detail);
    }

    return (text ? JSON.parse(text) : undefined) as T;
  }

  // Books
  async getAllBooks(): Promise<Book[]> {
    return this.request<Book[]>(API_ROUTES.BOOKS);
  }

  async getBooksByStatus(status: string): Promise<Book[]> {
    return this.request<Book[]>(`${API_ROUTES.BOOKS}?status=${status}`);
  }

  async getBookById(id: string): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_BY_ID(id));
  }

  async deleteBookById(id: string, password: string): Promise<void> {
    await this.request<void>(API_ROUTES.BOOKS_BY_ID(id), { method: 'DELETE' }, password);
  }

  async addNewBook(bookDto: CreateBookDto, password: string): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_ADD, {
      method: 'POST',
      body: JSON.stringify(bookDto),
    }, password);
  }

  async updateBook(id: string, bookDto: BookDto, password: string): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(bookDto),
    }, password);
  }

  async finishBook(id: string, bookDto: FinishBookDto, password: string): Promise<Book> {
    // Ensure rating is sent as decimal string (e.g., 10 -> "10.00")
    const body = JSON.stringify({
      rating: bookDto.rating.toFixed(2)
    });
    return this.request<Book>(API_ROUTES.BOOKS_FINISH(id), {
      method: 'PATCH',
      body,
    }, password);
  }

  async startBook(id: string, password: string): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_START(id), {
      method: 'PATCH',
    }, password);
  }

  /** true if the club password is right, false on 401. */
  async checkPassword(password: string): Promise<boolean> {
    try {
      await this.request<void>(API_ROUTES.CHECK_PASSWORD, { method: 'POST' }, password);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return false;
      }
      throw err;
    }
  }

  async getRandomBook(booksId?: string[]): Promise<Book> {
    const params = booksId?.length 
      ? `?${booksId.map(id => `booksId=${id}`).join('&')}` 
      : '';
    return this.request<Book>(`${API_ROUTES.BOOKS_RANDOM}${params}`);
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    return this.request<Statistics>(API_ROUTES.STATISTICS);
  }
}

export const apiService = new ApiService();

// Export individual functions for backwards compatibility
export const getBooks = () => apiService.getAllBooks();
export const getBookById = (id: string) => apiService.getBookById(id);
export const addBook = (book: CreateBookDto, password: string) => apiService.addNewBook(book, password);
export const startBook = (id: string, password: string) => apiService.startBook(id, password);
export const finishBook = (id: string, rating: number, password: string) =>
  apiService.finishBook(id, { rating }, password);
export const getRandomBook = (booksId?: string[]) => apiService.getRandomBook(booksId);
export const getStatistics = () => apiService.getStatistics();
export const checkPassword = (password: string) => apiService.checkPassword(password);

export default apiService;
