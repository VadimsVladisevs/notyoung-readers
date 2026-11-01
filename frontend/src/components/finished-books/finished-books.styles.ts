import { SxProps, Theme } from '@mui/material';

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

export const dividerStyles: SxProps<Theme> = {
  my: { xs: '2.5rem', md: '5rem' },
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
  width: { xs: '60%', sm: 200, md: 250 },
};

export const featuretteHeadingStyles: SxProps<Theme> = {
  fontSize: { xs: '1.5rem', md: '2.125rem' },
  fontWeight: 300,
  lineHeight: 1,
  letterSpacing: '-0.05rem',
  mb: 2,
};

export const featuretteDescStyles: SxProps<Theme> = {
  textAlign: 'left',
  lineHeight: { xs: 1.7, md: '2rem' },
  mb: 2,
};

export const ratingTextStyles: SxProps<Theme> = {
  fontWeight: 'bold',
};

export const featuretteImageStyles: SxProps<Theme> = {
  display: 'block',
  width: '100%',
  aspectRatio: '2 / 3',
  objectFit: 'cover',
};

export const editButtonStyles: SxProps<Theme> = {
  ml: 1,
  verticalAlign: 'middle',
};
