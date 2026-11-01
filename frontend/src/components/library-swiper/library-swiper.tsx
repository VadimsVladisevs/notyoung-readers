import React from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Keyboard, Navigation } from 'swiper/modules';
import { Book } from '../../types';
import { t } from '../../i18n';
import { LIBRARY_SWIPER_CONSTANTS } from './library-swiper.constants';
import * as styles from './library-swiper.styles';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import { coverSrc } from '../../utils/cover';
import EditBookButton from '../edit-book-button';

export interface LibrarySwiperProps {
  books: Book[];
  /** Omitted when the user may not edit books: the pencils are hidden. */
  onEdit?: (book: Book) => void;
}

const LibrarySwiper: React.FC<LibrarySwiperProps> = ({ books, onEdit }) => {
  return (
    <Box id={LIBRARY_SWIPER_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" sx={styles.titleStyles}>
          {t('sections.library.title')}
        </Typography>

        <Box sx={styles.swiperContainerStyles}>
          <IconButton
            className={LIBRARY_SWIPER_CONSTANTS.PREV_CLASS}
            aria-label={t('sections.library.prev')}
            sx={styles.navButtonStyles}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
          <Swiper
            modules={[FreeMode, Keyboard, Navigation]}
            slidesPerView="auto"
            spaceBetween={LIBRARY_SWIPER_CONSTANTS.SPACE_BETWEEN.MOBILE}
            breakpoints={{
              [LIBRARY_SWIPER_CONSTANTS.DESKTOP_FROM]: { spaceBetween: LIBRARY_SWIPER_CONSTANTS.SPACE_BETWEEN.DESKTOP },
            }}
            freeMode={{ enabled: true, sticky: false }}
            keyboard={{ enabled: true }}
            navigation={{
              prevEl: `.${LIBRARY_SWIPER_CONSTANTS.PREV_CLASS}`,
              nextEl: `.${LIBRARY_SWIPER_CONSTANTS.NEXT_CLASS}`,
            }}
            // Loop needs more slides than fit on screen, or it jumps.
            loop={books.length > LIBRARY_SWIPER_CONSTANTS.MIN_SLIDES_FOR_LOOP}
            style={styles.swiperStyles}
          >
            {books.map((book) => (
              <SwiperSlide key={book.id}>
                <Box sx={styles.cardStyles}>
                  <Box sx={styles.coverContainerStyles}>
                    <Box
                      component="img"
                      src={coverSrc(book)}
                      alt={book.title}
                      loading="lazy"
                      sx={styles.coverStyles}
                    />
                    {onEdit && <EditBookButton book={book} onEdit={onEdit} sx={styles.editButtonStyles} />}
                  </Box>
                  <Typography variant="subtitle2" sx={styles.titleTextStyles}>
                    {book.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={styles.authorTextStyles}>
                    {book.author}
                  </Typography>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          <IconButton
            className={LIBRARY_SWIPER_CONSTANTS.NEXT_CLASS}
            aria-label={t('sections.library.next')}
            sx={styles.navButtonStyles}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default LibrarySwiper;
