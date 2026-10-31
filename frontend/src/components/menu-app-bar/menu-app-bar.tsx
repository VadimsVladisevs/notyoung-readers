import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import ImageIcon from '@mui/icons-material/Image';
import { t } from '../../i18n';
import { useMenuAppBar } from './menu-app-bar.hooks';
import { MENU_APP_BAR_CONSTANTS } from './menu-app-bar.constants';
import * as styles from './menu-app-bar.styles';

export interface MenuAppBarProps {
  onOpenBookSelection: () => void;
  onOpenStatistics: () => void;
}

const MenuAppBar: React.FC<MenuAppBarProps> = ({ onOpenBookSelection, onOpenStatistics }) => {
  const { mobileOpen, handleDrawerToggle, handleNavClick, openExternalLink } = useMenuAppBar();

  const navItems = [
    { label: t('nav.library'), href: MENU_APP_BAR_CONSTANTS.NAV_ANCHORS.LIBRARY },
    { label: t('nav.currentBook'), href: MENU_APP_BAR_CONSTANTS.NAV_ANCHORS.CURRENT_BOOK },
    { label: t('nav.finishedBooks'), href: MENU_APP_BAR_CONSTANTS.NAV_ANCHORS.FINISHED_BOOKS },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={styles.drawerContainerStyles}>
      <Typography variant="h6" sx={styles.drawerTitleStyles}>
        {t('app.title')}
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              sx={styles.listItemButtonStyles}
              onClick={() => handleNavClick(item.href)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton sx={styles.listItemButtonStyles} onClick={onOpenBookSelection}>
            <ListItemText primary={t('nav.bookSelection')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={styles.listItemButtonStyles} onClick={onOpenStatistics}>
            <ListItemText primary={t('nav.statistics')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={styles.appBarStyles}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AutoStoriesOutlinedIcon sx={styles.desktopIconStyles} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={styles.brandTypographyStyles}
            >
              {t('app.title')}
            </Typography>

            <Box sx={styles.mobileNavContainerStyles}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <AutoStoriesOutlinedIcon sx={styles.mobileIconStyles} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={styles.mobileBrandTypographyStyles}
            >
              {t('app.title')}
            </Typography>

            <Box sx={styles.desktopNavContainerStyles}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  sx={styles.navButtonStyles}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={onOpenBookSelection}
                sx={styles.bookSelectionButtonStyles}
              >
                {t('nav.bookSelection')}
              </Button>
              <Button
                onClick={onOpenStatistics}
                sx={styles.statisticsButtonStyles}
              >
                {t('nav.statistics')}
              </Button>
              <Button sx={{ my: 2, color: 'white', minWidth: 'auto' }}>
                {t('nav.contacts')}
              </Button>
              <IconButton
                color="inherit"
                onClick={() => openExternalLink(MENU_APP_BAR_CONSTANTS.SOCIAL_LINKS.DISCORD)}
                sx={styles.iconButtonStyles}
              >
                <Box component="i" className="fab fa-discord" sx={styles.discordIconStyles} />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => openExternalLink(MENU_APP_BAR_CONSTANTS.SOCIAL_LINKS.FACEBOOK)}
                sx={styles.iconButtonStyles}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => openExternalLink(MENU_APP_BAR_CONSTANTS.SOCIAL_LINKS.MIRO)}
                sx={styles.iconButtonStyles}
              >
                <ImageIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={styles.drawerStyles}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default MenuAppBar;
