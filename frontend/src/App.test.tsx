import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from './App';
import { server } from './test/server';
import { allBooks, current, finishedHigh, newAnna, newBoris } from './test/books';
import { CSRF_HEADER } from './services/api';

const ADMIN = { username: 'admin', roles: ['ADMIN'] };
const PASSWORD = 'secret';

/** The backend session as MSW sees it: who /me returns, and a working login/logout. */
const mockAuth = (loggedIn: boolean) => {
  let user: typeof ADMIN | null = loggedIn ? ADMIN : null;
  server.use(
    http.get('/api/auth/me', () =>
      user ? HttpResponse.json(user) : HttpResponse.json({ status: 401 }, { status: 401 })),
    http.post('/api/auth/login', async ({ request }) => {
      const { username, password } = (await request.json()) as { username: string; password: string };
      if (username !== ADMIN.username || password !== PASSWORD) {
        return HttpResponse.json({ status: 401 }, { status: 401 });
      }
      user = ADMIN;
      return HttpResponse.json(ADMIN);
    }),
    http.post('/api/auth/logout', () => {
      user = null;
      return new HttpResponse(null, { status: 204 });
    }),
  );
};

/** Mocks the write endpoints and records the calls in order. */
const mockWrites = () => {
  const calls: { path: string; csrf: string | null; password: string | null; body?: unknown }[] = [];
  const record = async (request: Request) => {
    const text = await request.clone().text();
    calls.push({
      path: new URL(request.url).pathname,
      csrf: request.headers.get(CSRF_HEADER),
      password: request.headers.get('X-Club-Password'),
      body: text ? JSON.parse(text) : undefined,
    });
  };
  server.use(
    http.patch('/api/books/:id/finish', async ({ request }) => {
      await record(request);
      return HttpResponse.json({ ...current, status: 'finished' });
    }),
    http.patch('/api/books/:id/start', async ({ request }) => {
      await record(request);
      return HttpResponse.json({ ...newBoris, status: 'progress' });
    }),
  );
  return calls;
};

const renderApp = async ({ loggedIn = true } = {}) => {
  mockAuth(loggedIn);
  const user = userEvent.setup();
  render(<App />);
  // The finished list shows once the books are loaded.
  await screen.findAllByText(finishedHigh.title, { exact: false });
  // The auth state is known once the login or logout button shows.
  await screen.findAllByRole('button', { name: loggedIn ? 'Выйти' : 'Войти' });
  return user;
};

const openSelectionDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getAllByRole('button', { name: 'Выбор книги' })[0]);
  return screen.findByRole('dialog');
};

describe('App', () => {
  beforeEach(() => {
    document.cookie = 'XSRF-TOKEN=tok; path=/';
  });

  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('renders the club page with the loaded books', async () => {
    await renderApp({ loggedIn: false });

    expect(screen.getAllByText('Клуб "НЕЮНЫЙ ЧИТАТЕЛЬ"').length).toBeGreaterThan(0);
    expect(screen.getAllByText(current.title, { exact: false }).length).toBeGreaterThan(0);
  });

  describe('login', () => {
    const openLoginDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getAllByRole('button', { name: 'Войти' })[0]);
      return screen.findByRole('dialog', { name: /Вход/ });
    };

    it('hides book selection while logged out', async () => {
      await renderApp({ loggedIn: false });

      expect(screen.queryByRole('button', { name: 'Выбор книги' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Статистика' }).length).toBeGreaterThan(0);
    });

    it('logs in and shows book selection', async () => {
      const user = await renderApp({ loggedIn: false });
      const dialog = await openLoginDialog(user);

      await user.type(within(dialog).getByLabelText('Логин'), ADMIN.username);
      await user.type(within(dialog).getByLabelText('Пароль'), PASSWORD);
      await user.click(within(dialog).getByRole('button', { name: 'Войти' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getAllByRole('button', { name: 'Выбор книги' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Выйти' }).length).toBeGreaterThan(0);
    });

    it('shows an error on a wrong password and stays logged out', async () => {
      const user = await renderApp({ loggedIn: false });
      const dialog = await openLoginDialog(user);

      await user.type(within(dialog).getByLabelText('Логин'), ADMIN.username);
      await user.type(within(dialog).getByLabelText('Пароль'), 'wrong');
      await user.click(within(dialog).getByRole('button', { name: 'Войти' }));

      expect(await within(dialog).findByText('Неверный логин или пароль')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Выбор книги' })).not.toBeInTheDocument();
    });

    it('asks for both fields before calling the backend', async () => {
      let called = false;
      const user = await renderApp({ loggedIn: false });
      server.use(http.post('/api/auth/login', () => {
        called = true;
        return HttpResponse.json(ADMIN);
      }));
      const dialog = await openLoginDialog(user);

      await user.click(within(dialog).getByRole('button', { name: 'Войти' }));

      expect(within(dialog).getByText('Введите логин и пароль')).toBeInTheDocument();
      expect(called).toBe(false);
    });

    it('logs out and hides book selection', async () => {
      const user = await renderApp();

      await user.click(screen.getAllByRole('button', { name: 'Выйти' })[0]);

      await screen.findAllByRole('button', { name: 'Войти' });
      expect(screen.queryByRole('button', { name: 'Выбор книги' })).not.toBeInTheDocument();
    });

    it('shows the select button for no current book only when logged in', async () => {
      server.use(http.get('/api/books', () => HttpResponse.json(allBooks.filter((b) => b.status !== 'progress'))));
      const user = await renderApp({ loggedIn: false });

      expect(screen.queryByRole('button', { name: 'Выбрать книгу' })).not.toBeInTheDocument();

      const dialog = await openLoginDialog(user);
      await user.type(within(dialog).getByLabelText('Логин'), ADMIN.username);
      await user.type(within(dialog).getByLabelText('Пароль'), PASSWORD);
      await user.click(within(dialog).getByRole('button', { name: 'Войти' }));

      expect(await screen.findByRole('button', { name: 'Выбрать книгу' })).toBeInTheDocument();
    });
  });

  describe('selection dialog', () => {
    it('lists only new books and filters them by tag', async () => {
      const user = await renderApp();
      const dialog = await openSelectionDialog(user);

      expect(within(dialog).getByText(newAnna.title)).toBeInTheDocument();
      expect(within(dialog).getByText(newBoris.title)).toBeInTheDocument();
      expect(within(dialog).queryByText(current.title)).not.toBeInTheDocument();

      await user.type(within(dialog).getByPlaceholderText('Поиск книги..'), 'борис');

      expect(within(dialog).queryByText(newAnna.title)).not.toBeInTheDocument();
      expect(within(dialog).getByText(newBoris.title)).toBeInTheDocument();
    });

    it('filters by title when that filter is chosen', async () => {
      const user = await renderApp();
      const dialog = await openSelectionDialog(user);

      await user.click(within(dialog).getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: 'Название' }));
      await user.type(within(dialog).getByPlaceholderText('Поиск книги..'), 'мастер');

      expect(within(dialog).getByText(newAnna.title)).toBeInTheDocument();
      expect(within(dialog).queryByText(newBoris.title)).not.toBeInTheDocument();
    });

    it('confirms only when books are checked, then picks among them', async () => {
      const user = await renderApp();
      const dialog = await openSelectionDialog(user);
      const confirm = within(dialog).getByRole('button', { name: 'Подтвердить' });

      expect(confirm).toBeDisabled();

      await user.click(within(dialog).getByText(newBoris.title));

      expect(within(dialog).getByText('1')).toBeInTheDocument();
      expect(confirm).toBeEnabled();

      await user.click(confirm);

      const random = await screen.findByRole('dialog', { name: /Случайная книга/ });
      expect(within(random).getByText(newBoris.title)).toBeInTheDocument();
    });

    it('asks the backend for a random new book', async () => {
      let url = '';
      server.use(http.get('/api/books/random', ({ request }) => {
        url = request.url;
        return HttpResponse.json(newAnna);
      }));
      const user = await renderApp();
      const dialog = await openSelectionDialog(user);

      await user.click(within(dialog).getByRole('button', { name: 'Случайный выбор' }));

      const random = await screen.findByRole('dialog', { name: /Случайная книга/ });
      expect(within(random).getByText(newAnna.title)).toBeInTheDocument();
      expect(new URL(url).search).toBe('');
    });
  });

  describe('approval dialog', () => {
    const openApprovalDialog = async () => {
      const user = await renderApp();
      const dialog = await openSelectionDialog(user);
      await user.click(within(dialog).getByText(newBoris.title));
      await user.click(within(dialog).getByRole('button', { name: 'Подтвердить' }));
      const random = await screen.findByRole('dialog', { name: /Случайная книга/ });
      await user.click(within(random).getByRole('button', { name: 'Выбрать эту книгу' }));
      const approval = await screen.findByRole('dialog', { name: /Подтверждение выбора/ });
      return { user, approval };
    };

    it('requires a rating from 1 to 10 and asks for no password', async () => {
      const calls = mockWrites();
      const { user, approval } = await openApprovalDialog();
      const confirm = within(approval).getByRole('button', { name: 'Подтвердить' });

      expect(within(approval).getAllByRole('textbox')).toHaveLength(1);
      expect(within(approval).queryByLabelText('Код подтверждения')).not.toBeInTheDocument();

      await user.click(confirm);
      expect(within(approval).getByText('Введите оценку от 1 до 10')).toBeInTheDocument();

      const ratingField = within(approval).getByRole('textbox');
      await user.type(ratingField, '0');
      expect(ratingField).toHaveValue('');
      await user.type(ratingField, '11');
      expect(ratingField).toHaveValue('1');
      expect(calls).toEqual([]);
    });

    it('finishes the current book, then starts the chosen one, with the CSRF token', async () => {
      const calls = mockWrites();
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getByRole('textbox'), '8,5');
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(calls).toEqual([
        { path: `/api/books/${current.id}/finish`, csrf: 'tok', password: null, body: { rating: '8.50' } },
        { path: `/api/books/${newBoris.id}/start`, csrf: 'tok', password: null, body: undefined },
      ]);
    });

    it('says the session expired on 401 and hides book selection', async () => {
      mockWrites();
      server.use(http.patch('/api/books/:id/finish', () => HttpResponse.json({ status: 401 }, { status: 401 })));
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getByRole('textbox'), '9');
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      expect(await within(approval).findByText('Сессия истекла. Войдите снова.')).toBeInTheDocument();
      // hidden: the open dialog makes the app bar aria-hidden
      expect(screen.queryByRole('button', { name: 'Выбор книги', hidden: true })).not.toBeInTheDocument();
    });

    it('shows a generic error when a write fails', async () => {
      mockWrites();
      server.use(http.patch('/api/books/:id/start', () => HttpResponse.json({ status: 409 }, { status: 409 })));
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getByRole('textbox'), '9');
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      expect(await within(approval).findByText('Не удалось сохранить. Попробуйте ещё раз.')).toBeInTheDocument();
    });
  });

  describe('add book', () => {
    const NEW_BOOK = { title: 'Вий', author: 'Гоголь', tag: 'вера', wiki: 'Повесть' };

    /** Mocks the add endpoint: records the body and returns the books with the new one from then on. */
    const mockAdd = () => {
      const bodies: unknown[] = [];
      let books = allBooks;
      server.use(
        http.get('/api/books', () => HttpResponse.json(books)),
        http.post('/api/books/add', async ({ request }) => {
          const body = (await request.json()) as typeof NEW_BOOK;
          bodies.push({ body, csrf: request.headers.get(CSRF_HEADER) });
          const added = { ...current, ...body, id: 'a1', status: 'new' as const, image: undefined };
          books = [...allBooks, added];
          return HttpResponse.json(added, { status: 201 });
        }),
      );
      return bodies;
    };

    const openAddDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getAllByRole('button', { name: 'Добавить книгу' })[0]);
      return screen.findByRole('dialog', { name: /Новая книга/ });
    };

    const fill = async (user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, book: Partial<typeof NEW_BOOK>) => {
      if (book.title) await user.type(within(dialog).getByLabelText('Название'), book.title);
      if (book.author) await user.type(within(dialog).getByLabelText('Автор'), book.author);
      if (book.tag) await user.type(within(dialog).getByLabelText('Участник'), book.tag);
      if (book.wiki) await user.type(within(dialog).getByLabelText('Описание'), book.wiki);
    };

    it('is hidden while logged out', async () => {
      await renderApp({ loggedIn: false });

      expect(screen.queryByRole('button', { name: 'Добавить книгу' })).not.toBeInTheDocument();
    });

    it('adds a book without a cover, which then shows the placeholder', async () => {
      const bodies = mockAdd();
      const user = await renderApp();
      const dialog = await openAddDialog(user);

      await fill(user, dialog, { ...NEW_BOOK, title: '  Вий ' });
      await user.click(within(dialog).getByRole('button', { name: 'Добавить' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(bodies).toEqual([{ body: NEW_BOOK, csrf: 'tok' }]);
      const covers = await screen.findAllByRole('img', { name: 'Вий' });
      expect(covers[0]).toHaveAttribute('src', 'cover-placeholder.svg');
    });

    it('suggests existing tags', async () => {
      const user = await renderApp();
      const dialog = await openAddDialog(user);

      await user.type(within(dialog).getByLabelText('Участник'), 'бо');

      expect(await screen.findByRole('option', { name: 'борис' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'анна' })).not.toBeInTheDocument();
    });

    it('asks for every field before calling the backend', async () => {
      const bodies = mockAdd();
      const user = await renderApp();
      const dialog = await openAddDialog(user);

      await fill(user, dialog, { title: 'Вий', author: 'Гоголь', tag: 'вера', wiki: '   ' });
      await user.click(within(dialog).getByRole('button', { name: 'Добавить' }));

      expect(within(dialog).getByText('Заполните все поля')).toBeInTheDocument();
      expect(within(dialog).getByLabelText('Описание')).toHaveAttribute('aria-invalid', 'true');
      expect(within(dialog).getByLabelText('Название')).toHaveAttribute('aria-invalid', 'false');
      expect(bodies).toEqual([]);
    });

    it('says the session expired on 401 and hides the menu item', async () => {
      server.use(http.post('/api/books/add', () => HttpResponse.json({ status: 401 }, { status: 401 })));
      const user = await renderApp();
      const dialog = await openAddDialog(user);

      await fill(user, dialog, NEW_BOOK);
      await user.click(within(dialog).getByRole('button', { name: 'Добавить' }));

      expect(await within(dialog).findByText('Сессия истекла. Войдите снова.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Добавить книгу', hidden: true })).not.toBeInTheDocument();
    });

    it('shows a generic error when saving fails', async () => {
      server.use(http.post('/api/books/add', () => HttpResponse.json({ status: 400 }, { status: 400 })));
      const user = await renderApp();
      const dialog = await openAddDialog(user);

      await fill(user, dialog, NEW_BOOK);
      await user.click(within(dialog).getByRole('button', { name: 'Добавить' }));

      expect(await within(dialog).findByText('Не удалось сохранить. Попробуйте ещё раз.')).toBeInTheDocument();
    });
  });
});
