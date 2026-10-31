import React from 'react';
import { SxProps, Theme } from '@mui/material';
import { LIBRARY_SWIPER_CONSTANTS } from './library-swiper.constants';

export const containerStyles: SxProps<Theme> = {
  pt: 10,
  pb: 1,
};

export const titleStyles: SxProps<Theme> = {
  textAlign: 'center',
  fontWeight: 700,
  fontSize: { xs: '2.5rem', md: '4rem' },
  my: 4,
};

export const swiperContainerStyles: SxProps<Theme> = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

export const slideContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

export const imageContainerStyles: SxProps<Theme> = {
  width: LIBRARY_SWIPER_CONSTANTS.IMAGE_WIDTH,
  height: LIBRARY_SWIPER_CONSTANTS.IMAGE_HEIGHT,
  overflow: 'hidden',
  margin: 'auto',
};

export const imageStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

export const cardBodyStyles: SxProps<Theme> = {
  p: 1,
  borderTopStyle: 'solid',
  borderTopWidth: 'thin',
  borderTopColor: '#ddd',
  width: LIBRARY_SWIPER_CONSTANTS.CARD_BODY_WIDTH,
  height: LIBRARY_SWIPER_CONSTANTS.CARD_BODY_HEIGHT,
  marginLeft: `${LIBRARY_SWIPER_CONSTANTS.CARD_BODY_MARGIN_LEFT}px`,
};

export const titleTextStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const authorTextStyles: SxProps<Theme> = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

const navButtonBaseStyles: SxProps<Theme> = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  '&:hover': {
    opacity: 0.7,
  },
};

export const prevButtonStyles: SxProps<Theme> = {
  ...navButtonBaseStyles,
  '&::after': {
    content: '"❮"',
    fontSize: '24px',
    color: '#212529',
    fontWeight: 'bold',
  },
};

export const nextButtonStyles: SxProps<Theme> = {
  ...navButtonBaseStyles,
  '&::after': {
    content: '"❯"',
    fontSize: '24px',
    color: '#212529',
    fontWeight: 'bold',
  },
};

export const swiperStyles: React.CSSProperties = {
  padding: '20px 0',
};