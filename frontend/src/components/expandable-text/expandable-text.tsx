import React from 'react';
import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import { t } from '../../i18n';
import { useExpandableText } from './expandable-text.hooks';
import * as styles from './expandable-text.styles';

export interface ExpandableTextProps {
  text: string;
  /** Lines shown while collapsed. */
  lines: number;
  sx?: SxProps<Theme>;
}

/** A book description cut to `lines`, with «Читать дальше» / «Свернуть» when it doesn't fit. */
const ExpandableText: React.FC<ExpandableTextProps> = ({ text, lines, sx }) => {
  const { ref, expanded, overflowing, toggle } = useExpandableText(text);

  return (
    <Box>
      <Typography
        ref={ref}
        variant="body1"
        sx={[expanded ? {} : styles.clampStyles(lines), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {text}
      </Typography>
      {(overflowing || expanded) && (
        <Button size="small" aria-expanded={expanded} onClick={toggle} sx={styles.toggleButtonStyles}>
          {t(expanded ? 'sections.readLess' : 'sections.readMore')}
        </Button>
      )}
    </Box>
  );
};

export default ExpandableText;
