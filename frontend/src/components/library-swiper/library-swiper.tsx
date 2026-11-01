import React from 'react';
import { Box, Typography, Container, IconButton, TextField, InputAdornment, Chip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Keyboard, Navigation } from 'swiper/modules';
import { Book } from '../../types';
import { t } from '../../i18n';
import { LIBRARY_SWIPER_CONSTANTS, LIBRARY_FILTERS } from './library-swiper.constants';
import { useLibrarySwiper } from './library-swiper.hooks';
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

/** «Читаем» / «Прочитана · 9» on the cover; nothing for a book on the list. */
const statusLabel = (book: Book): string | null => {
  if (book.status === 'progress') return t('sections.library.statusProgress');
  if (book.status !== 'finished') return null;
  return book.rating == null
    ? t('sections.library.statusFinished')
    : t('sections.library.statusFinishedRating', { rating: book.rating });
};

const LibrarySwiper: React.FC<LibrarySwiperProps> = ({ books, onEdit }) => {
  const { query, setQuery, filter, setFilter, filteredBooks } = useLibrarySwiper(books);
  const loop = filteredBooks.length > LIBRARY_SWIPER_CONSTANTS.MIN_SLIDES_FOR_LOOP;

  return (
    <Box id={LIBRARY_SWIPER_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" sx={styles.titleStyles}>
          {t('sections.library.title')}
        </Typography>

        <Box sx={styles.filterBarStyles}>
          <TextField
            size="small"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sections.library.searchLabel')}
            sx={styles.searchFieldStyles}
            slotProps={{
              htmlInput: { 'aria-label': t('sections.library.searchLabel') },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box role="group" aria-label={t('sections.library.statusFilter')} sx={styles.chipsStyles}>
            {LIBRARY_FILTERS.map(({ value, labelKey }) => (
              <Chip
                key={value}
                label={t(labelKey)}
                clickable
                aria-pressed={filter === value}
                color={filter === value ? 'primary' : 'default'}
                variant={filter === value ? 'filled' : 'outlined'}
                onClick={() => setFilter(value)}
              />
            ))}
          </Box>
        </Box>

        {filteredBooks.length === 0 ? (
          <Typography color="text.secondary" sx={styles.notFoundStyles}>
            {t('sections.library.notFound')}
          </Typography>
        ) : (
          <Box sx={styles.swiperContainerStyles}>
            <IconButton
              className={LIBRARY_SWIPER_CONSTANTS.PREV_CLASS}
              aria-label={t('sections.library.prev')}
              sx={styles.navButtonStyles}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <Swiper
              // A new filter starts from the first book, and loop on/off needs a fresh swiper.
              key={`${filter}|${query}|${loop}`}
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
              loop={loop}
              style={styles.swiperStyles}
            >
              {filteredBooks.map((book) => {
                const label = statusLabel(book);
                return (
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
                        {label && (
                          <Chip
                            size="small"
                            label={label}
                            sx={book.status === 'progress' ? styles.progressChipStyles : styles.finishedChipStyles}
                          />
                        )}
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
                );
              })}
            </Swiper>
            <IconButton
              className={LIBRARY_SWIPER_CONSTANTS.NEXT_CLASS}
              aria-label={t('sections.library.next')}
              sx={styles.navButtonStyles}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LibrarySwiper;
