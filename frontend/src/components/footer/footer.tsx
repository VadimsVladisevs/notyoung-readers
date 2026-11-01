import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { FOOTER_CONSTANTS } from './footer.constants';
import * as styles from './footer.styles';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="body2">
          © Copyright {FOOTER_CONSTANTS.CURRENT_YEAR} Reader's club
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
