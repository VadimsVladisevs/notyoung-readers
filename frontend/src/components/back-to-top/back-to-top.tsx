import React from 'react';
import { Fab, useScrollTrigger, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { t } from '../../i18n';
import * as styles from './back-to-top.styles';

/** Scrolled past this many px, the button shows. */
export const BACK_TO_TOP_THRESHOLD = 600;

/** A round «Наверх» button in the bottom-right corner, shown once the page is scrolled down. */
const BackToTop: React.FC = () => {
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: BACK_TO_TOP_THRESHOLD });

  return (
    <Zoom in={scrolled}>
      <Fab
        size="small"
        color="secondary"
        aria-label={t('sections.backToTop')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={styles.fabStyles}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default BackToTop;
