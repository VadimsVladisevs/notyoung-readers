import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { allBooks, current, newAnna } from '../test/books';
import { ApiError, CSRF_HEADER, apiService, finishBook, getBooks, startBook } from './api';

/** Records every request so the test can inspect headers and body. */
const recordRequests = () => {
  const requests: Request[] = [];
  server.events.on('request:start', ({ request }) => {
    requests.push(request.clone());
  });
  return requests;
};

const setCsrfCookie = (value: string) => {
  document.cookie = `XSRF-TOKEN=${value}; path=/`;
};

describe('api', () => {
  afterEach(() => {
    server.events.removeAllListeners();
    document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('sends no CSRF header on reads', async () => {
    setCsrfCookie('tok');
    const requests = recordRequests();

    expect(await getBooks()).toEqual(allBooks);

    expect(requests[0].headers.has(CSRF_HEADER)).toBe(false);
  });

  it('sends the CSRF token and the rating on finish, and no password header', async () => {
    setCsrfCookie('tok%2Bx');
    const requests = recordRequests();
    server.use(http.patch('/api/books/:id/finish', () => HttpResponse.json({ ...current, status: 'finished' })));

    await finishBook(current.id, 8.5);

    expect(requests[0].url).toMatch(`/api/books/${current.id}/finish`);
    expect(requests[0].headers.get(CSRF_HEADER)).toBe('tok+x');
    expect(requests[0].headers.has('X-Club-Password')).toBe(false);
    expect(requests[0].headers.get('Content-Type')).toBe('application/json');
    expect(await requests[0].json()).toEqual({ rating: '8.50' });
  });

  it('sends the CSRF token and no body on start', async () => {
    setCsrfCookie('tok');
    const requests = recordRequests();
    server.use(http.patch('/api/books/:id/start', () => HttpResponse.json({ ...newAnna, status: 'progress' })));

    await startBook(newAnna.id);

    expect(requests[0].headers.get(CSRF_HEADER)).toBe('tok');
    expect(requests[0].headers.has('Content-Type')).toBe(false);
  });

  it('sends no CSRF header when there is no cookie', async () => {
    const requests = recordRequests();
    server.use(http.patch('/api/books/:id/start', () => HttpResponse.json({ ...newAnna, status: 'progress' })));

    await startBook(newAnna.id);

    expect(requests[0].headers.has(CSRF_HEADER)).toBe(false);
  });

  it('accepts an empty DELETE response', async () => {
    server.use(http.delete('/api/books/:id', () => new HttpResponse(null, { status: 204 })));

    await expect(apiService.deleteBookById(newAnna.id)).resolves.toBeUndefined();
  });

  it('throws ApiError with the status and ProblemDetail detail', async () => {
    server.use(http.patch('/api/books/:id/start', () =>
      HttpResponse.json({ title: 'Conflict', status: 409, detail: 'Book is not new' }, { status: 409 })));

    const error = await startBook(newAnna.id).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.detail).toBe('Book is not new');
  });

  describe('auth', () => {
    const admin = { username: 'admin', roles: ['ADMIN'] };

    it('logs in with JSON credentials and the CSRF token', async () => {
      setCsrfCookie('tok');
      const requests = recordRequests();
      server.use(http.post('/api/auth/login', () => HttpResponse.json(admin)));

      expect(await apiService.login('admin', 'secret')).toEqual(admin);
      expect(requests[0].headers.get(CSRF_HEADER)).toBe('tok');
      expect(await requests[0].json()).toEqual({ username: 'admin', password: 'secret' });
    });

    it('throws ApiError 401 on a wrong login', async () => {
      server.use(http.post('/api/auth/login', () => HttpResponse.json({ status: 401 }, { status: 401 })));

      const error = await apiService.login('admin', 'wrong').catch((e) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(401);
    });

    it('me returns the user, or null on 401', async () => {
      server.use(http.get('/api/auth/me', () => HttpResponse.json(admin)));
      expect(await apiService.me()).toEqual(admin);

      server.use(http.get('/api/auth/me', () => HttpResponse.json({ status: 401 }, { status: 401 })));
      expect(await apiService.me()).toBeNull();
    });

    it('me throws on other errors', async () => {
      server.use(http.get('/api/auth/me', () => new HttpResponse(null, { status: 500 })));

      await expect(apiService.me()).rejects.toBeInstanceOf(ApiError);
    });

    it('logs out', async () => {
      server.use(http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })));

      await expect(apiService.logout()).resolves.toBeUndefined();
    });
  });
});
