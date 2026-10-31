import React from 'react';
import { Box, Divider, CircularProgress, Backdrop } from '@mui/material';
import MenuAppBar from '../menu-app-bar';
import LibrarySwiper from '../library-swiper';
import CurrentBook from '../current-book';
import FinishedBooks from '../finished-books';
import BookSelectionDialog from '../book-selection-dialog';
import StatisticsDialog from '../statistics-dialog';
import ApprovalDialog from '../approval-dialog';
import Footer from '../footer';
import { useHomePage } from './home-page.hooks';
import * as styles from './home-page.styles';

const HomePage: React.FC = () => {
  const {
    allBooks,
    newBooks,
    currentBook,
    finishedBooks,
    loading,
    selectionDialogOpen,
    statisticsDialogOpen,
    approvalDialogOpen,
    pendingNewBook,
    handleOpenSelectionDialog,
    handleCloseSelectionDialog,
    handleSelectBook,
    handleCloseApprovalDialog,
    handleApprovalConfirm,
    handleGetRandomBook,
    handleOpenStatistics,
    handleCloseStatistics,
  } = useHomePage();

  return (
    <Box sx={styles.mainContainerStyles}>
      <Backdrop
        sx={styles.backdropStyles}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MenuAppBar 
        onOpenBookSelection={handleOpenSelectionDialog}
        onOpenStatistics={handleOpenStatistics} 
      />
      
      <Box sx={styles.contentBoxStyles}>
        <LibrarySwiper books={allBooks} />
        
        <Divider sx={styles.dividerStyles} />
        
        <CurrentBook
          book={currentBook}
          onSelectClick={handleOpenSelectionDialog}
        />
        
        <Divider sx={styles.dividerStyles} />
        
        <FinishedBooks books={finishedBooks} />
      </Box>

      <Footer />

      <BookSelectionDialog
        open={selectionDialogOpen}
        onClose={handleCloseSelectionDialog}
        books={newBooks}
        onSelectBook={handleSelectBook}
        onGetRandomBook={handleGetRandomBook}
      />

      <StatisticsDialog
        open={statisticsDialogOpen}
        onClose={handleCloseStatistics}
        books={allBooks}
      />

      <ApprovalDialog
        open={approvalDialogOpen}
        onClose={handleCloseApprovalDialog}
        onConfirm={handleApprovalConfirm}
        currentBook={currentBook}
        newBook={pendingNewBook}
      />
    </Box>
  );
};

export default HomePage;
