import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';
import { Book } from '../../types';
import { t } from '../../i18n';
import { FINISHED_BOOKS_CONSTANTS } from './finished-books.constants';
import * as styles from './finished-books.styles';

export interface FinishedBooksProps {
  books: Book[];
}

const FinishedBooks: React.FC<FinishedBooksProps> = ({ books }) => {
  return (
    <Box id={FINISHED_BOOKS_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h1" component="h2" sx={styles.titleStyles}>
          {t('sections.finishedBooks.title')}
        </Typography>

        {books.map((book, index) => (
          <React.Fragment key={book.id}>
            <Divider sx={styles.dividerStyles} />
            <Box sx={index % 2 === 0 ? styles.featuretteRowStyles : styles.featuretteRowReverseStyles}>
              <Box sx={styles.textColumnStyles}>
                <Typography variant="h4" sx={styles.featuretteHeadingStyles}>
                  {index + 1}. {book.title}. {book.author}
                </Typography>
                <Typography variant="body1" sx={styles.featuretteDescStyles}>
                  {book.wiki}
                </Typography>
                <Typography variant="body1" sx={styles.ratingTextStyles}>
                  Оценка клуба - {book.rating ?? '-'}
                </Typography>
              </Box>
              <Box sx={styles.imageColumnStyles}>
                <Box
                  component="img"
                  src={book.image}
                  alt={book.title}
                  sx={styles.featuretteImageStyles}
                />
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Container>
    </Box>
  );
};

export default FinishedBooks;
