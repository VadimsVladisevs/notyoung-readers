import { SxProps, Theme } from '@mui/material';

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

export const dividerStyles: SxProps<Theme> = {
  my: '5rem',
};

export const featuretteRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-start' },
  gap: 4,
};

export const featuretteRowReverseStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row-reverse' },
  alignItems: { xs: 'center', md: 'flex-start' },
  gap: 4,
};

export const textColumnStyles: SxProps<Theme> = {
  flex: 1,
  textAlign: 'left',
};

export const imageColumnStyles: SxProps<Theme> = {
  flexShrink: 0,
};

export const featuretteHeadingStyles: SxProps<Theme> = {
  fontWeight: 300,
  lineHeight: 1,
  letterSpacing: '-0.05rem',
  mb: 2,
};

export const featuretteDescStyles: SxProps<Theme> = {
  textAlign: 'left',
  lineHeight: '2rem',
  mb: 2,
};

export const ratingTextStyles: SxProps<Theme> = {
  fontWeight: 'bold',
};

export const featuretteImageStyles: SxProps<Theme> = {
  width: { xs: 200, md: 250 },
  height: { xs: 300, md: 375 },
  objectFit: 'cover',
};
