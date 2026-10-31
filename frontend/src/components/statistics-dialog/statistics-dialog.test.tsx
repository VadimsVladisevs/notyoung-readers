import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatisticsDialog from './statistics-dialog';
import { allBooks } from '../../test/books';

// jsdom has no canvas: show the chart's labels and values as text instead.
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: { data: { labels: string[]; datasets: { data: number[] }[] } }) => (
    <output data-testid="chart">
      {data.labels.map((label, i) => `${label}=${data.datasets[0].data[i]}`).join(';')}
    </output>
  ),
}));

describe('StatisticsDialog', () => {
  it('shows read-book counts per tag, then average ratings after the toggle', async () => {
    const user = userEvent.setup();
    render(<StatisticsDialog open onClose={() => {}} books={allBooks} />);

    // Only progress + finished books count: Борис has the current book and one finished.
    expect(screen.getByTestId('chart')).toHaveTextContent('Борис=2;Анна=1');

    await user.click(screen.getByRole('button', { name: 'Количество' }));

    expect(screen.getByRole('button', { name: 'Рейтинг' })).toBeInTheDocument();
    expect(screen.getByTestId('chart')).toHaveTextContent('Борис=9;Анна=7.5');
  });
});
