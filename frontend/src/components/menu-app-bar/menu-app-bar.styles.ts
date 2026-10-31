import { SxProps, Theme } from '@mui/material';

export const appBarStyles: SxProps<Theme> = {
  backgroundColor: '#212529',
};

export const brandTypographyStyles: SxProps<Theme> = {
  mr: 4,
  // Desktop nav needs ~1150px; below lg the hamburger layout is used.
  display: { xs: 'none', lg: 'flex' },
  flexShrink: 0,
  fontWeight: 700,
  color: 'inherit',
  textDecoration: 'none',
};

export const mobileBrandTypographyStyles: SxProps<Theme> = {
  mr: 2,
  display: { xs: 'flex', lg: 'none' },
  flexGrow: 1,
  // Fits next to the menu button at phone width; wraps on the narrowest phones.
  fontSize: { xs: '0.9rem', sm: '1.5rem' },
  whiteSpace: { xs: 'normal', sm: 'nowrap' },
  fontWeight: 700,
  color: 'inherit',
  textDecoration: 'none',
};

export const drawerTitleStyles: SxProps<Theme> = {
  my: 2,
  fontWeight: 700,
};

export const navButtonStyles: SxProps<Theme> = {
  my: 2,
  color: 'white',
  display: 'block',
};

export const bookSelectionButtonStyles: SxProps<Theme> = {
  my: 2,
  color: 'white',
  display: 'block',
  backgroundColor: 'rgba(255,255,255,0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
};

export const statisticsButtonStyles: SxProps<Theme> = {
  my: 2,
  color: 'white',
  display: 'block',
  borderRight: '1px solid silver',
  pr: 2,
};

export const iconButtonStyles: SxProps<Theme> = {
  my: 2,
};

export const drawerStyles: SxProps<Theme> = {
  display: { xs: 'block', lg: 'none' },
  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
};

export const desktopIconStyles: SxProps<Theme> = {
  display: { xs: 'none', lg: 'flex' },
  mr: 1,
};

export const mobileIconStyles: SxProps<Theme> = {
  display: { xs: 'flex', lg: 'none' },
  mr: 1,
};

export const desktopNavContainerStyles: SxProps<Theme> = {
  flexGrow: 1,
  display: { xs: 'none', lg: 'flex' },
  justifyContent: 'flex-end',
};

export const mobileNavContainerStyles: SxProps<Theme> = {
  flexGrow: 1,
  display: { xs: 'flex', lg: 'none' },
};

export const discordIconStyles: SxProps<Theme> = {
  fontSize: '1.2rem',
};

export const contactsButtonStyles: SxProps<Theme> = {
  my: 2,
  color: 'white',
  minWidth: 'auto',
};

export const listItemButtonStyles: SxProps<Theme> = {
  textAlign: 'center',
};

export const drawerContainerStyles: SxProps<Theme> = {
  textAlign: 'center',
};
