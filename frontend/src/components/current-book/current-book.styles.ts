import { SxProps, Theme } from '@mui/material';
import { CURRENT_BOOK_CONSTANTS } from './current-book.constants';

export const containerStyles: SxProps<Theme> = {
  py: 4,
  // Anchor scroll lands the heading below the fixed navbar (up to 93px tall on desktop).
  scrollMarginTop: '48px',
};

export const titleStyles: SxProps<Theme> = {
  textAlign: 'center',
  fontWeight: 700,
  fontSize: { xs: '2.5rem', md: '4rem' },
  my: 4,
};

export const contentBoxStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-start' },
  justifyContent: 'center',
  gap: 4,
};

export const imageContainerStyles: SxProps<Theme> = {
  width: CURRENT_BOOK_CONSTANTS.IMAGE_WIDTH,
  height: CURRENT_BOOK_CONSTANTS.IMAGE_HEIGHT,
  overflow: 'hidden',
  flexShrink: 0,
};

export const imageStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const textContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  textAlign: 'left',
  flex: 1,
};

export const bookTitleStyles: SxProps<Theme> = {
  fontWeight: 300,
  lineHeight: 1,
  letterSpacing: '-0.05rem',
};

export const bookDescriptionStyles: SxProps<Theme> = {
  textAlign: 'left',
  lineHeight: '2rem',
};


export const placeholderTitleStyles: SxProps<Theme> = {
  mt: 2,
};

export const selectButtonStyles: SxProps<Theme> = {
  mt: 2,
  textTransform: 'none',
};
