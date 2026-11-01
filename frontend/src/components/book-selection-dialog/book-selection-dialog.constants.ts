export const BOOK_SELECTION_DIALOG_CONSTANTS = {
  IMAGE_WIDTH: 120,
  IMAGE_HEIGHT: 180,
  GRID_SPACING: 2,
} as const;

export const SEARCH_FILTER_OPTIONS = {
  TAG: 'tag',
  TITLE: 'title',
  AUTHOR: 'author',
} as const;

export type SearchFilterOption = typeof SEARCH_FILTER_OPTIONS[keyof typeof SEARCH_FILTER_OPTIONS];
