import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Badge,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Book } from '../../types';
import { t } from '../../i18n';
import RandomBookDialog from '../random-book-dialog';
import { useBookSelectionDialog } from './book-selection-dialog.hooks';
import { SEARCH_FILTER_OPTIONS, SearchFilterOption } from './book-selection-dialog.constants';
import * as styles from './book-selection-dialog.styles';

export interface BookSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  books: Book[];
  onSelectBook: (book: Book) => Promise<void>;
  onGetRandomBook: () => Promise<Book | null>;
}

const BookSelectionDialog: React.FC<BookSelectionDialogProps> = ({
  open,
  onClose,
  books,
  onSelectBook,
  onGetRandomBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilterOption>(SEARCH_FILTER_OPTIONS.TAG);
  
  const {
    randomDialogOpen,
    randomBook,
    selectedBooks,
    handleToggleBookSelection,
    handleClearSelection,
    handleOpenRandomDialog,
    handleCloseRandomDialog,
    handleSetRandomBook,
    handleSelectRandomBook,
  } = useBookSelectionDialog(onSelectBook);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter((book) => {
      switch (searchFilter) {
        case SEARCH_FILTER_OPTIONS.TITLE:
          return book.title.toLowerCase().includes(query);
        case SEARCH_FILTER_OPTIONS.AUTHOR:
          return book.author.toLowerCase().includes(query);
        case SEARCH_FILTER_OPTIONS.TAG:
        default:
          return book.tag.toLowerCase().includes(query);
      }
    });
  }, [books, searchQuery, searchFilter]);

  const handleRandomClick = async () => {
    const book = await onGetRandomBook();
    if (book) {
      handleSetRandomBook(book);
      handleOpenRandomDialog();
    }
  };

  const handleConfirmSelectedClick = () => {
    if (selectedBooks.size === 0) return;
    
    const selectedBooksArray = books.filter(book => selectedBooks.has(book.id));
    const randomIndex = Math.floor(Math.random() * selectedBooksArray.length);
    const randomBook = selectedBooksArray[randomIndex];
    
    handleSetRandomBook(randomBook);
    handleOpenRandomDialog();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchFilter(SEARCH_FILTER_OPTIONS.TAG);
    handleClearSelection();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={styles.dialogTitleStyles}>
          {t('dialogs.bookSelection.title')}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={styles.dialogContentStyles}>
          <TextField
            fullWidth
            placeholder={t('dialogs.bookSelection.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={styles.searchFieldStyles}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value as SearchFilterOption)}
                    variant="standard"
                    disableUnderline
                    sx={styles.searchFilterSelectStyles}
                  >
                    <MenuItem value={SEARCH_FILTER_OPTIONS.TAG}>
                      {t('dialogs.bookSelection.searchFilters.tag')}
                    </MenuItem>
                    <MenuItem value={SEARCH_FILTER_OPTIONS.TITLE}>
                      {t('dialogs.bookSelection.searchFilters.title')}
                    </MenuItem>
                    <MenuItem value={SEARCH_FILTER_OPTIONS.AUTHOR}>
                      {t('dialogs.bookSelection.searchFilters.author')}
                    </MenuItem>
                  </Select>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={styles.cardsContainerStyles}>
            {filteredBooks.length === 0 ? (
              <Typography color="text.secondary" sx={styles.noBooksTextStyles}>
                {t('dialogs.bookSelection.noBooks')}
              </Typography>
            ) : (
              filteredBooks.map((book) => (
                <Box
                  key={book.id}
                  sx={styles.getCardStyles(selectedBooks.has(book.id))}
                  onClick={() => handleToggleBookSelection(book)}
                >
                  <Box sx={styles.cardImageContainerStyles}>
                    <Box
                      component="img"
                      src={book.image}
                      alt={book.title}
                      sx={styles.cardImageStyles}
                    />
                  </Box>
                  <Box sx={styles.cardBodyStyles}>
                    <Typography sx={styles.cardTitleStyles}>
                      {book.title}
                    </Typography>
                    <Typography sx={styles.cardAuthorStyles}>
                      {book.author}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={styles.actionsContainerStyles}>
          <Button
            onClick={handleRandomClick}
            color="error"
            variant="contained"
            sx={styles.randomButtonStyles}
          >
            {t('dialogs.bookSelection.randomButton')}
          </Button>
          <Box sx={styles.spacerBoxStyles} />
          <Badge 
            badgeContent={selectedBooks.size} 
            color="error"
          >
            <Button
              onClick={handleConfirmSelectedClick}
              color="success"
              variant="contained"
              disabled={selectedBooks.size === 0}
              sx={styles.confirmSelectedButtonStyles}
            >
              {t('dialogs.bookSelection.confirmSelectedButton')}
            </Button>
          </Badge>
        </DialogActions>
      </Dialog>

      <RandomBookDialog
        open={randomDialogOpen}
        onClose={handleCloseRandomDialog}
        book={randomBook}
        onSelectBook={handleSelectRandomBook}
        onGetNewRandom={handleRandomClick}
      />
    </>
  );
};

export default BookSelectionDialog;
