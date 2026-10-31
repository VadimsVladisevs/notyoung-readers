import { useState, useCallback } from 'react';

export const useMenuAppBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return {
    mobileOpen,
    handleDrawerToggle,
    handleNavClick,
    openExternalLink,
  };
};
