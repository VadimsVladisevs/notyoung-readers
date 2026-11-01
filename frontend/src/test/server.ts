import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { allBooks } from './books';

/** Default handlers: read endpoints with the fixture books. Tests add write handlers with `server.use`. */
export const server = setupServer(
  http.get('/api/books', () => HttpResponse.json(allBooks)),
);
