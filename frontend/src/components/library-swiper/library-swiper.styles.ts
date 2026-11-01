import React from 'react';
import { SxProps, Theme } from '@mui/material';
import { LIBRARY_SWIPER_CONSTANTS } from './library-swiper.constants';

export const containerStyles: SxProps<Theme> = {
  py: 4,
  // Anchor scroll lands the heading below the fixed navbar (up to 93px tall on desktop).
  scrollMarginTop: '48px',
};

export const titleStyles: SxProps<Theme> = {
  textAlign: 'center',
  fontWeight: 700,
  fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
  my: { xs: 2, md: 4 },
};

export const swiperContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  '& .swiper-slide': {
    width: LIBRARY_SWIPER_CONSTANTS.CARD_WIDTH,
    height: 'auto',
  },
};

export const cardStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
};

export const coverContainerStyles: SxProps<Theme> = {
  position: 'relative',
  aspectRatio: '2 / 3',
  borderRadius: 1,
  overflow: 'hidden',
  boxShadow: 2,
  mb: 1,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '@media (hover: hover)': {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },
};

export const coverStyles: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const editButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  top: 6,
  right: 6,
  bgcolor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: 1,
  '&:hover': {
    bgcolor: 'white',
  },
};

export const titleTextStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  lineHeight: 1.3,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const authorTextStyles: SxProps<Theme> = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

export const navButtonStyles: SxProps<Theme> = {
  display: { xs: 'none', md: 'inline-flex' },
  flexShrink: 0,
  color: 'primary.main',
  // Swiper adds these classes; keep MUI's display from overriding them.
  '&.swiper-button-disabled': {
    opacity: 0.3,
    cursor: 'default',
  },
  '&.swiper-button-lock': {
    display: 'none',
  },
};

export const swiperStyles: React.CSSProperties = {
  flex: 1,
  // A flex child must be allowed to shrink, or the swiper widens the page (the 320px sideways scroll).
  minWidth: 0,
  padding: '8px 4px 16px',
};

export const filterBarStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  mb: 2,
};

export const searchFieldStyles: SxProps<Theme> = {
  width: '100%',
  maxWidth: 420,
};

export const chipsStyles: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 1,
};

export const notFoundStyles: SxProps<Theme> = {
  textAlign: 'center',
  py: 6,
};

const statusChipBaseStyles = {
  position: 'absolute',
  left: 6,
  bottom: 6,
  maxWidth: 'calc(100% - 12px)',
  fontWeight: 700,
  boxShadow: 1,
} as const;

export const progressChipStyles: SxProps<Theme> = {
  ...statusChipBaseStyles,
  bgcolor: 'secondary.main',
  color: 'primary.main',
};

export const finishedChipStyles: SxProps<Theme> = {
  ...statusChipBaseStyles,
  bgcolor: 'rgba(33, 37, 41, 0.85)',
  color: 'white',
};
