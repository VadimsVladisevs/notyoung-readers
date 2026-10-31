import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from './App';
import { server } from './test/server';
import { current, finishedHigh, newAnna, newBoris } from './test/books';
import { PASSWORD_HEADER } from './services/api';

const PASSWORD = 'secret';

/** Mocks the write endpoints and records the calls in order. */
const mockWrites = () => {
  const calls: { path: string; password: string | null; body?: unknown }[] = [];
  const record = async (request: Request) => {
    const text = await request.clone().text();
    calls.push({
      path: new URL(request.url).pathname,
      password: request.headers.get(PASSWORD_HEADER),
      body: text ? JSON.parse(text) : undefined,
    });
  };
  server.use(
    http.post('/api/check-password', async ({ request }) => {
      await record(request);
      return new HttpResponse(null, { status: request.headers.get(PASSWORD_HEADER) === PASSWORD ? 200 : 401 });
    }),
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

const renderApp = async () => {
  const user = userEvent.setup();
  render(<App />);
  // The finished list shows once the books are loaded.
  await screen.findAllByText(finishedHigh.title, { exact: false });
  return user;
};

const openSelectionDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getAllByRole('button', { name: 'Выбор книги' })[0]);
  return screen.findByRole('dialog');
};

describe('App', () => {
  it('renders the club page with the loaded books', async () => {
    await renderApp();

    expect(screen.getAllByText('Клуб "НЕЮНЫЙ ЧИТАТЕЛЬ"').length).toBeGreaterThan(0);
    expect(screen.getAllByText(current.title, { exact: false }).length).toBeGreaterThan(0);
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

    it('requires a rating from 1 to 10 and the password', async () => {
      const calls = mockWrites();
      const { user, approval } = await openApprovalDialog();
      const [ratingField] = within(approval).getAllByRole('textbox');
      const confirm = within(approval).getByRole('button', { name: 'Подтвердить' });

      await user.click(confirm);
      expect(within(approval).getByText('Введите оценку от 1 до 10')).toBeInTheDocument();

      await user.type(ratingField, '0');
      expect(ratingField).toHaveValue('');
      await user.type(ratingField, '11');
      expect(ratingField).toHaveValue('1');

      await user.click(confirm);
      expect(within(approval).getByText('Введите код подтверждения')).toBeInTheDocument();
      expect(calls).toEqual([]);
    });

    it('shows the wrong-password message and changes nothing', async () => {
      const calls = mockWrites();
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getAllByRole('textbox')[0], '8,5');
      await user.type(within(approval).getByLabelText('Код подтверждения'), 'wrong');
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      expect(await within(approval).findByText('Неправильный пароль!')).toBeInTheDocument();
      expect(calls.map((c) => c.path)).toEqual(['/api/check-password']);
    });

    it('finishes the current book, then starts the chosen one, with the password', async () => {
      const calls = mockWrites();
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getAllByRole('textbox')[0], '8,5');
      await user.type(within(approval).getByLabelText('Код подтверждения'), PASSWORD);
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(calls).toEqual([
        { path: '/api/check-password', password: PASSWORD, body: undefined },
        { path: `/api/books/${current.id}/finish`, password: PASSWORD, body: { rating: '8.50' } },
        { path: `/api/books/${newBoris.id}/start`, password: PASSWORD, body: undefined },
      ]);
    });

    it('shows a generic error when a write fails', async () => {
      mockWrites();
      server.use(http.patch('/api/books/:id/start', () => HttpResponse.json({ status: 409 }, { status: 409 })));
      const { user, approval } = await openApprovalDialog();

      await user.type(within(approval).getAllByRole('textbox')[0], '9');
      await user.type(within(approval).getByLabelText('Код подтверждения'), PASSWORD);
      await user.click(within(approval).getByRole('button', { name: 'Подтвердить' }));

      expect(await within(approval).findByText('Не удалось сохранить. Попробуйте ещё раз.')).toBeInTheDocument();
    });
  });
});
