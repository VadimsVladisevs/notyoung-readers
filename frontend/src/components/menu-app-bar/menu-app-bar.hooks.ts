import React, { useState, useCallback } from 'react';

export const useMenuAppBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  }, []);

  const openExternalLink = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleOpenAccountMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchor(event.currentTarget);
  }, []);

  const handleCloseAccountMenu = useCallback(() => {
    setAccountAnchor(null);
  }, []);

  return {
    mobileOpen,
    handleDrawerToggle,
    handleNavClick,
    openExternalLink,
    accountAnchor,
    handleOpenAccountMenu,
    handleCloseAccountMenu,
  };
};
