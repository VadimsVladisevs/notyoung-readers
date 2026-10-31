import { Book } from '../types';

const book = (id: string, fields: Partial<Book>): Book => ({
  id,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  title: `Title ${id}`,
  author: `Author ${id}`,
  image: `images/${id}.jpg`,
  status: 'new',
  tag: 'анна',
  wiki: `Wiki ${id}`,
  ...fields,
});

export const newAnna = book('n1', { title: 'Мастер и Маргарита', author: 'Булгаков', tag: 'анна' });
export const newBoris = book('n2', { title: 'Идиот', author: 'Достоевский', tag: 'борис' });
export const current = book('p1', { title: 'Обломов', author: 'Гончаров', status: 'progress', tag: 'борис' });
export const finishedLow = book('f1', { title: 'Нос', author: 'Гоголь', status: 'finished', rating: 7.5, tag: 'анна' });
export const finishedHigh = book('f2', { title: 'Чевенгур', author: 'Платонов', status: 'finished', rating: 9, tag: 'борис' });

export const allBooks = [newAnna, finishedLow, current, newBoris, finishedHigh];
