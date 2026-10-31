import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BooksProvider } from './context/books-context';
import HomePage from './components/home-page';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#212529',
    },
    secondary: {
      main: '#4ECCA3',
    },
  },
  typography: {
    fontFamily: '"Merriweather", Georgia, serif',
    h1: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      fontSize: '4rem',
      margin: '30px',
    },
    h2: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      fontSize: '2rem',
      margin: '30px',
    },
    h3: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      fontSize: '1rem',
      margin: '30px',
    },
    h4: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
    },
    body1: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 400,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BooksProvider>
        <HomePage />
      </BooksProvider>
    </ThemeProvider>
  );
}

export default App;
