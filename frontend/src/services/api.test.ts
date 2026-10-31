import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { allBooks, current, newAnna } from '../test/books';
import { ApiError, PASSWORD_HEADER, apiService, checkPassword, finishBook, getBooks, startBook } from './api';

/** Records every request to the given handler so the test can inspect headers and body. */
const recordRequests = () => {
  const requests: Request[] = [];
  server.events.on('request:start', ({ request }) => {
    requests.push(request.clone());
  });
  return requests;
};

describe('api', () => {
  afterEach(() => server.events.removeAllListeners());

  it('sends no password header on reads', async () => {
    const requests = recordRequests();

    expect(await getBooks()).toEqual(allBooks);

    expect(requests[0].headers.has(PASSWORD_HEADER)).toBe(false);
  });

  it('sends the password header and the rating on finish', async () => {
    const requests = recordRequests();
    server.use(http.patch('/api/books/:id/finish', () => HttpResponse.json({ ...current, status: 'finished' })));

    await finishBook(current.id, 8.5, 'secret');

    expect(requests[0].url).toMatch(`/api/books/${current.id}/finish`);
    expect(requests[0].headers.get(PASSWORD_HEADER)).toBe('secret');
    expect(requests[0].headers.get('Content-Type')).toBe('application/json');
    expect(await requests[0].json()).toEqual({ rating: '8.50' });
  });

  it('sends the password header and no body on start', async () => {
    const requests = recordRequests();
    server.use(http.patch('/api/books/:id/start', () => HttpResponse.json({ ...newAnna, status: 'progress' })));

    await startBook(newAnna.id, 'secret');

    expect(requests[0].headers.get(PASSWORD_HEADER)).toBe('secret');
    expect(requests[0].headers.has('Content-Type')).toBe(false);
  });

  it('accepts an empty DELETE response', async () => {
    server.use(http.delete('/api/books/:id', () => new HttpResponse(null, { status: 204 })));

    await expect(apiService.deleteBookById(newAnna.id, 'secret')).resolves.toBeUndefined();
  });

  it('throws ApiError with the status and ProblemDetail detail', async () => {
    server.use(http.patch('/api/books/:id/start', () =>
      HttpResponse.json({ title: 'Conflict', status: 409, detail: 'Book is not new' }, { status: 409 })));

    const error = await startBook(newAnna.id, 'secret').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.detail).toBe('Book is not new');
  });

  describe('checkPassword', () => {
    it('is true on 200 and sends the header', async () => {
      const requests = recordRequests();
      server.use(http.post('/api/check-password', () => new HttpResponse(null, { status: 200 })));

      expect(await checkPassword('secret')).toBe(true);
      expect(requests[0].headers.get(PASSWORD_HEADER)).toBe('secret');
    });

    it('is false on 401', async () => {
      server.use(http.post('/api/check-password', () => HttpResponse.json({ status: 401 }, { status: 401 })));

      expect(await checkPassword('wrong')).toBe(false);
    });

    it('throws on other errors', async () => {
      server.use(http.post('/api/check-password', () => new HttpResponse(null, { status: 500 })));

      await expect(checkPassword('secret')).rejects.toBeInstanceOf(ApiError);
    });
  });
});
