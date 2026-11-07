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
  Menu,
  MenuItem,
  Switch,
  SvgIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import ImageIcon from '@mui/icons-material/Image';
import { t } from '../../i18n';
import { useMenuAppBar } from './menu-app-bar.hooks';
import { MENU_APP_BAR_CONSTANTS } from './menu-app-bar.constants';
import * as styles from './menu-app-bar.styles';

export interface MenuAppBarProps {
  /** Omitted when the user may not select a book: the menu item is hidden. */
  onOpenBookSelection?: () => void;
  /** Omitted when the user may not add books: the menu item is hidden. */
  onOpenAddBook?: () => void;
  onOpenStatistics: () => void;
  /** `null` = logged out. */
  username: string | null;
  editMode: boolean;
  /** Omitted when the user may not edit books: the edit-mode switch is hidden. */
  onToggleEditMode?: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

const MenuAppBar: React.FC<MenuAppBarProps> = ({
  onOpenBookSelection,
  onOpenAddBook,
  onOpenStatistics,
  username,
  editMode,
  onToggleEditMode,
  onLogin,
  onLogout,
}) => {
  const {
    mobileOpen,
    handleDrawerToggle,
    handleNavClick,
    openExternalLink,
    accountAnchor,
    handleOpenAccountMenu,
    handleCloseAccountMenu,
  } = useMenuAppBar();

  const navItems = [
    { label: t('nav.currentBook'), href: MENU_APP_BAR_CONSTANTS.NAV_ANCHORS.CURRENT_BOOK },
    { label: t('nav.library'), href: MENU_APP_BAR_CONSTANTS.NAV_ANCHORS.LIBRARY },
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
        {onOpenBookSelection && (
          <ListItem disablePadding>
            <ListItemButton sx={styles.listItemButtonStyles} onClick={onOpenBookSelection}>
              <ListItemText primary={t('nav.bookSelection')} />
            </ListItemButton>
          </ListItem>
        )}
        {onOpenAddBook && (
          <ListItem disablePadding>
            <ListItemButton sx={styles.listItemButtonStyles} onClick={onOpenAddBook}>
              <ListItemText primary={t('nav.addBook')} />
            </ListItemButton>
          </ListItem>
        )}
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
              {onOpenBookSelection && (
                <Button
                  onClick={onOpenBookSelection}
                  sx={styles.bookSelectionButtonStyles}
                >
                  {t('nav.bookSelection')}
                </Button>
              )}
              {onOpenAddBook && (
                <Button onClick={onOpenAddBook} sx={styles.navButtonStyles}>
                  {t('nav.addBook')}
                </Button>
              )}
              <Button
                onClick={onOpenStatistics}
                sx={styles.statisticsButtonStyles}
              >
                {t('nav.statistics')}
              </Button>
              <IconButton
                color="inherit"
                onClick={() => openExternalLink(MENU_APP_BAR_CONSTANTS.SOCIAL_LINKS.DISCORD)}
                sx={styles.iconButtonStyles}
              >
                <SvgIcon sx={styles.discordIconStyles}>
                  <path d={MENU_APP_BAR_CONSTANTS.DISCORD_ICON_PATH} />
                </SvgIcon>
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

            <IconButton
              size="large"
              color="inherit"
              aria-label={username ? t('nav.accountOf', { name: username }) : t('nav.account')}
              aria-controls={accountAnchor ? 'account-menu' : undefined}
              aria-haspopup="true"
              onClick={handleOpenAccountMenu}
              sx={styles.accountButtonStyles}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={accountAnchor}
              open={accountAnchor !== null}
              onClose={handleCloseAccountMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {username === null ? (
                <MenuItem onClick={() => { handleCloseAccountMenu(); onLogin(); }}>
                  {t('nav.login')}
                </MenuItem>
              ) : [
                <MenuItem key="user" disabled>{username}</MenuItem>,
                onToggleEditMode && (
                  <MenuItem
                    key="edit-mode"
                    role="menuitemcheckbox"
                    aria-checked={editMode}
                    onClick={onToggleEditMode}
                  >
                    <Box component="span" sx={styles.editModeLabelStyles}>{t('nav.editMode')}</Box>
                    <Switch edge="end" size="small" checked={editMode} tabIndex={-1} slotProps={{ input: { 'aria-hidden': true } }} />
                  </MenuItem>
                ),
                <Divider key="divider" />,
                <MenuItem key="logout" onClick={() => { handleCloseAccountMenu(); onLogout(); }}>
                  {t('nav.logout')}
                </MenuItem>,
              ]}
            </Menu>
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
