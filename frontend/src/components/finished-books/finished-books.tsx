import React from 'react';
import { Box, Typography, Container, Divider, Button } from '@mui/material';
import { Book } from '../../types';
import { t } from '../../i18n';
import { FINISHED_BOOKS_CONSTANTS } from './finished-books.constants';
import * as styles from './finished-books.styles';
import { coverSrc } from '../../utils/cover';
import EditBookButton from '../edit-book-button';
import ExpandableText from '../expandable-text';
import { useFinishedBooks } from './finished-books.hooks';

export interface FinishedBooksProps {
  books: Book[];
  /** Omitted when the user may not edit books: the pencils are hidden. */
  onEdit?: (book: Book) => void;
}

const FinishedBooks: React.FC<FinishedBooksProps> = ({ books, onEdit }) => {
  const { visible, hasMore, showMore } = useFinishedBooks(books.length);

  return (
    <Box id={FINISHED_BOOKS_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h1" component="h2" sx={styles.titleStyles}>
          {t('sections.finishedBooks.title')}
        </Typography>

        {books.slice(0, visible).map((book, index) => (
          <React.Fragment key={book.id}>
            <Divider sx={styles.dividerStyles} />
            <Box sx={index % 2 === 0 ? styles.featuretteRowStyles : styles.featuretteRowReverseStyles}>
              <Box sx={styles.textColumnStyles}>
                <Typography variant="h4" sx={styles.featuretteHeadingStyles}>
                  {index + 1}. {book.title}. {book.author}
                  {onEdit && <EditBookButton book={book} onEdit={onEdit} sx={styles.editButtonStyles} />}
                </Typography>
                <ExpandableText
                  text={book.wiki}
                  lines={FINISHED_BOOKS_CONSTANTS.DESCRIPTION_LINES}
                  sx={styles.featuretteDescStyles}
                />
                <Typography variant="body1" sx={styles.ratingTextStyles}>
                  Оценка клуба - {book.rating ?? '-'}
                </Typography>
              </Box>
              <Box sx={styles.imageColumnStyles}>
                <Box
                  component="img"
                  src={coverSrc(book)}
                  alt={book.title}
                  sx={styles.featuretteImageStyles}
                />
              </Box>
            </Box>
          </React.Fragment>
        ))}

        {hasMore && (
          <Box sx={styles.showMoreContainerStyles}>
            <Button variant="outlined" onClick={showMore} sx={styles.showMoreButtonStyles}>
              {t('sections.finishedBooks.showMore')}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FinishedBooks;
