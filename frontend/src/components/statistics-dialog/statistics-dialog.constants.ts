export const STATISTICS_DIALOG_CONSTANTS = {
  CHART_MAX_SCALE_OFFSET: 1,
  MAX_RATING: 10,
} as const;

export type StatisticsMode = 'count' | 'rating';

export const getRandomRgba = (): string => {
  const randomByte = () => Math.floor(Math.random() * 256);
  const randomPercent = () => (Math.random() * 0.5 + 0.5).toFixed(2);
  return `rgba(${randomByte()}, ${randomByte()}, ${randomByte()}, ${randomPercent()})`;
};

export const generateColors = (count: number): string[] => {
  return Array.from({ length: count }, () => getRandomRgba());
};
