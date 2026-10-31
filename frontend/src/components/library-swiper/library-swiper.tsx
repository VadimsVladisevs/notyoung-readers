import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Book } from '../../types';
import { t } from '../../i18n';
import { LIBRARY_SWIPER_CONSTANTS } from './library-swiper.constants';
import * as styles from './library-swiper.styles';

import 'swiper/css';
import 'swiper/css/navigation';

export interface LibrarySwiperProps {
  books: Book[];
}

const getDirection = (): 'horizontal' | 'vertical' => {
  return window.innerWidth <= LIBRARY_SWIPER_CONSTANTS.BREAKPOINTS.MOBILE ? 'vertical' : 'horizontal';
};

const LibrarySwiper: React.FC<LibrarySwiperProps> = ({ books }) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>(getDirection());

  useEffect(() => {
    const handleResize = () => {
      const newDirection = getDirection();
      setDirection(newDirection);
      if (swiperInstance) {
        swiperInstance.changeDirection(newDirection);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [swiperInstance]);

  return (
    <Box id={LIBRARY_SWIPER_CONSTANTS.SECTION_ID} sx={styles.containerStyles}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" sx={styles.titleStyles}>
          {t('sections.library.title')}
        </Typography>

        <Box sx={styles.swiperContainerStyles}>
          <Box className="swiper-button-prev-custom" sx={styles.prevButtonStyles} />
          <Swiper
            modules={[Navigation]}
            spaceBetween={LIBRARY_SWIPER_CONSTANTS.SPACE_BETWEEN}
            slidesPerView={LIBRARY_SWIPER_CONSTANTS.SLIDES_PER_VIEW}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            loop={true}
            direction={direction}
            onSwiper={setSwiperInstance}
            breakpoints={{
              0: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            style={styles.swiperStyles}
          >
            {books.map((book) => (
              <SwiperSlide key={book.id}>
                <Box sx={styles.slideContainerStyles}>
                  <Box sx={styles.imageContainerStyles}>
                    <Box
                      component="img"
                      src={book.image}
                      alt={book.title}
                      sx={styles.imageStyles}
                    />
                  </Box>
                  <Box sx={styles.cardBodyStyles}>
                    <Typography variant="subtitle2" sx={styles.titleTextStyles}>
                      {book.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={styles.authorTextStyles}>
                      {book.author}
                    </Typography>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          <Box className="swiper-button-next-custom" sx={styles.nextButtonStyles} />
        </Box>
      </Container>
    </Box>
  );
};

export default LibrarySwiper;
