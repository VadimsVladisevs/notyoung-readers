import { Book, Statistics, CreateBookDto, BookDto, FinishBookDto, CurrentUser } from '../types';
import { API_ROUTES } from '../routes';

/** Spring Security's CSRF token: read from this cookie, sent back in this header on every write. */
export const CSRF_COOKIE = 'XSRF-TOKEN';
export const CSRF_HEADER = 'X-XSRF-TOKEN';

const readCsrfToken = (): string | undefined => {
  const cookie = document.cookie.split('; ').find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  return cookie && decodeURIComponent(cookie.slice(CSRF_COOKIE.length + 1));
};

/** A non-2xx response. `detail` comes from the backend's ProblemDetail body, if any. */
export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail?: string) {
    super(detail ?? `HTTP error! status: ${status}`);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);
    // FormData sets its own multipart Content-Type (with the boundary)
    if (options?.body !== undefined && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    const method = options?.method ?? 'GET';
    const csrfToken = readCsrfToken();
    if (method !== 'GET' && method !== 'HEAD' && csrfToken) {
      headers.set(CSRF_HEADER, csrfToken);
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

  async deleteBookById(id: string): Promise<void> {
    await this.request<void>(API_ROUTES.BOOKS_BY_ID(id), { method: 'DELETE' });
  }

  async addNewBook(bookDto: CreateBookDto): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_ADD, {
      method: 'POST',
      body: JSON.stringify(bookDto),
    });
  }

  async updateBook(id: string, bookDto: BookDto): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(bookDto),
    });
  }

  async finishBook(id: string, bookDto: FinishBookDto): Promise<Book> {
    // Ensure rating is sent as decimal string (e.g., 10 -> "10.00")
    const body = JSON.stringify({
      rating: bookDto.rating.toFixed(2)
    });
    return this.request<Book>(API_ROUTES.BOOKS_FINISH(id), {
      method: 'PATCH',
      body,
    });
  }

  async startBook(id: string): Promise<Book> {
    return this.request<Book>(API_ROUTES.BOOKS_START(id), {
      method: 'PATCH',
    });
  }

  /** Uploads a JPEG cover; the backend names it and returns the book with the new `image`. */
  async uploadCover(id: string, file: File): Promise<Book> {
    const body = new FormData();
    body.append('file', file);
    return this.request<Book>(API_ROUTES.BOOKS_COVER(id), { method: 'PUT', body });
  }

  // Auth (server session cookie)
  async login(username: string, password: string): Promise<CurrentUser> {
    return this.request<CurrentUser>(API_ROUTES.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>(API_ROUTES.AUTH_LOGOUT, { method: 'POST' });
  }

  /** The logged-in user, or null when logged out (401). Also gives the browser its CSRF cookie. */
  async me(): Promise<CurrentUser | null> {
    try {
      return await this.request<CurrentUser>(API_ROUTES.AUTH_ME);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return null;
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
export const addBook = (book: CreateBookDto) => apiService.addNewBook(book);
export const editBook = (id: string, book: BookDto) => apiService.updateBook(id, book);
export const deleteBook = (id: string) => apiService.deleteBookById(id);
export const uploadCover = (id: string, file: File) => apiService.uploadCover(id, file);
export const startBook = (id: string) => apiService.startBook(id);
export const finishBook = (id: string, rating: number) => apiService.finishBook(id, { rating });
export const getRandomBook = (booksId?: string[]) => apiService.getRandomBook(booksId);
export const getStatistics = () => apiService.getStatistics();

export default apiService;
