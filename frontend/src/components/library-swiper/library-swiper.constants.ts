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
