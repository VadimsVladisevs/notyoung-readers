import { useMemo, useState, useCallback } from 'react';
import { Book, TagStatistics } from '../../types';
import { t } from '../../i18n';
import { 
  STATISTICS_DIALOG_CONSTANTS, 
  StatisticsMode, 
  generateColors 
} from './statistics-dialog.constants';

export const useStatisticsDialog = (books: Book[]) => {
  const [mode, setMode] = useState<StatisticsMode>('count');

  const tagStatistics = useMemo((): TagStatistics[] => {
    const result: Record<string, TagStatistics> = {};

    books.forEach((book) => {
      const tag = book.tag;

      if (!result[tag]) {
        result[tag] = {
          tag,
          count: 0,
          totalRating: 0,
          averageRating: 0,
          books: [],
        };
      }

      if (book.status === 'progress' || book.status === 'finished') {
        result[tag].count += 1;
        if (book.rating) {
          result[tag].totalRating += book.rating;
        }
        result[tag].books.push({
          author: book.author,
          title: book.title,
          rating: book.rating,
        });
      }
    });

    return Object.values(result).map((tagInfo) => {
      const booksWithRating = tagInfo.books.filter((b) => b.rating != null).length;
      tagInfo.averageRating = booksWithRating > 0 
        ? tagInfo.totalRating / booksWithRating 
        : 0;
      return tagInfo;
    });
  }, [books]);

  const sortedStatistics = useMemo(() => {
    if (mode === 'count') {
      return [...tagStatistics].sort((a, b) => b.count - a.count);
    } else {
      return [...tagStatistics]
        .filter((item) => item.averageRating > 0)
        .sort((a, b) => b.averageRating - a.averageRating);
    }
  }, [tagStatistics, mode]);

  const chartData = useMemo(() => {
    if (sortedStatistics.length === 0) return null;

    const labels = sortedStatistics.map(
      (item) => item.tag.charAt(0).toUpperCase() + item.tag.slice(1)
    );
    const data = mode === 'count'
      ? sortedStatistics.map((item) => item.count)
      : sortedStatistics.map((item) => item.averageRating);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: generateColors(sortedStatistics.length),
        },
      ],
    };
  }, [sortedStatistics, mode]);

  const chartOptions = useMemo(() => {
    if (sortedStatistics.length === 0) return null;

    const maxValue = mode === 'count'
      ? Math.max(...sortedStatistics.map((s) => s.count)) + STATISTICS_DIALOG_CONSTANTS.CHART_MAX_SCALE_OFFSET
      : STATISTICS_DIALOG_CONSTANTS.MAX_RATING;

    return {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const index = context.dataIndex;
              const tagInfo = sortedStatistics[index];
              const lines: string[] = [];
              lines.push(`${t('dialogs.statistics.totalBooks')}: ${tagInfo.count}`);
              tagInfo.books.forEach((book) => {
                lines.push(`${book.author} - ${book.title}. ${t('dialogs.statistics.rating')}: ${book.rating ?? '-'}`);
              });
              if (tagInfo.averageRating > 0) {
                lines.push(`${t('dialogs.statistics.averageRating')}: ${tagInfo.averageRating.toFixed(2)}`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: maxValue,
          ticks: {
            stepSize: 1,
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y: {
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  }, [sortedStatistics, mode]);

  const totalBooks = useMemo(() => {
    return tagStatistics.reduce((sum, item) => sum + item.count, 0);
  }, [tagStatistics]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'count' ? 'rating' : 'count'));
  }, []);

  const modeButtonText = mode === 'count' 
    ? t('dialogs.statistics.modeCount') 
    : t('dialogs.statistics.modeRating');

  return {
    chartData,
    chartOptions,
    totalBooks,
    mode,
    toggleMode,
    modeButtonText,
  };
};
