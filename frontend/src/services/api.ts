import { Book, Statistics, CreateBookDto, BookDto, FinishBookDto } from '../types';
import { API_ROUTES } from '../routes';

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
    // Ensure rating is sent as decimal string (e.g., 10 -> "10.0")
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
export const startBook = (id: string) => apiService.startBook(id);
export const finishBook = (id: string, rating?: number) => 
  apiService.finishBook(id, { rating: rating ?? 0 });
export const getRandomBook = (booksId?: string[]) => apiService.getRandomBook(booksId);
export const getStatistics = () => apiService.getStatistics();

export const checkPassword = async (password: string): Promise<{ result: boolean }> => {
  const formData = new FormData();
  formData.append('password', password);
  
  const response = await fetch(API_ROUTES.CHECK_PASSWORD, {
    method: 'POST',
    body: formData,
  });
  return { result: response.ok };
};

export default apiService;
