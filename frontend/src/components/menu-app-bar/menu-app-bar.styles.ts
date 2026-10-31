import { SxProps, Theme } from '@mui/material';

export const appBarStyles: SxProps<Theme> = {
  backgroundColor: '#212529',
};

export const brandTypographyStyles: SxProps<Theme> = {
  mr: 4,
  display: { xs: 'none', md: 'flex' },
  fontWeight: 700,
  color: 'inherit',
  textDecoration: 'none',
};

export const mobileBrandTypographyStyles: SxProps<Theme> = {
  mr: 2,
  display: { xs: 'flex', md: 'none' },
  flexGrow: 1,
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
  display: { xs: 'block', md: 'none' },
  '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
};

export const desktopIconStyles: SxProps<Theme> = {
  display: { xs: 'none', md: 'flex' },
  mr: 1,
};

export const mobileIconStyles: SxProps<Theme> = {
  display: { xs: 'flex', md: 'none' },
  mr: 1,
};

export const desktopNavContainerStyles: SxProps<Theme> = {
  flexGrow: 1,
  display: { xs: 'none', md: 'flex' },
  justifyContent: 'flex-end',
};

export const mobileNavContainerStyles: SxProps<Theme> = {
  flexGrow: 1,
  display: { xs: 'flex', md: 'none' },
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
