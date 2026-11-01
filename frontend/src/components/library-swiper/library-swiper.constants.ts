export const LIBRARY_SWIPER_CONSTANTS = {
  SECTION_ID: 'library',
  PREV_CLASS: 'library-swiper-prev',
  NEXT_CLASS: 'library-swiper-next',
  /** Card width per breakpoint; `slidesPerView: 'auto'` fits as many as the row holds. */
  CARD_WIDTH: { xs: 140, sm: 170, md: 190 },
  SPACE_BETWEEN: { MOBILE: 16, DESKTOP: 24 },
  /** MUI `md`, in px: wider gaps and the arrows from here up. */
  DESKTOP_FROM: 900,
  MIN_SLIDES_FOR_LOOP: 8,
} as const;

/** The status chips above the swiper, in order. */
export const LIBRARY_FILTERS = [
  { value: 'all', labelKey: 'sections.library.filterAll' },
  { value: 'new', labelKey: 'sections.library.filterNew' },
  { value: 'progress', labelKey: 'sections.library.filterProgress' },
  { value: 'finished', labelKey: 'sections.library.filterFinished' },
] as const;
