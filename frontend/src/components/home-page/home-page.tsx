import React from 'react';
import { Box, Divider, CircularProgress, Backdrop } from '@mui/material';
import MenuAppBar from '../menu-app-bar';
import LibrarySwiper from '../library-swiper';
import CurrentBook from '../current-book';
import FinishedBooks from '../finished-books';
import BookSelectionDialog from '../book-selection-dialog';
import StatisticsDialog from '../statistics-dialog';
import ApprovalDialog from '../approval-dialog';
import LoginDialog from '../login-dialog';
import AddBookDialog from '../add-book-dialog';
import EditBookDialog from '../edit-book-dialog';
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
    username,
    canSelectBook,
    editing,
    editMode,
    handleToggleEditMode,
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
    loginDialogOpen,
    handleOpenLoginDialog,
    handleCloseLoginDialog,
    addBookDialogOpen,
    handleOpenAddBookDialog,
    handleCloseAddBookDialog,
    handleAddBook,
    editingBook,
    handleOpenEditBook,
    handleCloseEditBook,
    handleEditBook,
    handleDeleteBook,
    tags,
    handleLogout,
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
        onOpenBookSelection={canSelectBook ? handleOpenSelectionDialog : undefined}
        onOpenAddBook={editing ? handleOpenAddBookDialog : undefined}
        onOpenStatistics={handleOpenStatistics}
        username={username}
        editMode={editMode}
        onToggleEditMode={canSelectBook ? handleToggleEditMode : undefined}
        onLogin={handleOpenLoginDialog}
        onLogout={handleLogout}
      />
      
      <Box sx={styles.contentBoxStyles}>
        <CurrentBook
          book={currentBook}
          onSelectClick={canSelectBook ? handleOpenSelectionDialog : undefined}
          onEdit={editing ? handleOpenEditBook : undefined}
        />
        
        <Divider sx={styles.dividerStyles} />
        
        <LibrarySwiper books={allBooks} onEdit={editing ? handleOpenEditBook : undefined} />
        
        <Divider sx={styles.dividerStyles} />
        
        <FinishedBooks books={finishedBooks} onEdit={editing ? handleOpenEditBook : undefined} />
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

      <LoginDialog
        open={loginDialogOpen}
        onClose={handleCloseLoginDialog}
      />

      <AddBookDialog
        open={addBookDialogOpen}
        onClose={handleCloseAddBookDialog}
        onSubmit={handleAddBook}
        tags={tags}
      />

      <EditBookDialog
        book={editingBook}
        onClose={handleCloseEditBook}
        onSubmit={handleEditBook}
        onDelete={handleDeleteBook}
        tags={tags}
      />
    </Box>
  );
};

export default HomePage;
