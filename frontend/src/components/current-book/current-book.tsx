import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Book } from '../../types';
import { t } from '../../i18n';
import { CURRENT_BOOK_CONSTANTS } from './current-book.constants';
import * as styles from './current-book.styles';

export interface CurrentBookProps {
  book: Book | null;
  onSelectClick: () => void;
}

const CurrentBook: React.FC<CurrentBookProps> = ({ book, onSelectClick }) => {
  return (
    <Box id={CURRENT_BOOK_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" sx={styles.titleStyles}>
          {t('sections.currentBook.title')}
        </Typography>

        {book ? (
          <Box sx={styles.contentBoxStyles}>
            <Box sx={styles.textContainerStyles}>
              <Typography variant="h4" sx={styles.bookTitleStyles}>
                {book.author}. {book.title}
              </Typography>
              <Typography variant="body1" sx={styles.bookDescriptionStyles}>
                {book.wiki}
              </Typography>
            </Box>
            <Box sx={styles.imageContainerStyles}>
              <Box
                component="img"
                src={book.image}
                alt={book.title}
                sx={styles.imageStyles}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={styles.placeholderTitleStyles}>
              {t('sections.currentBook.noBook')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onSelectClick}
              sx={styles.selectButtonStyles}
            >
              {t('sections.currentBook.selectButton')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CurrentBook;
