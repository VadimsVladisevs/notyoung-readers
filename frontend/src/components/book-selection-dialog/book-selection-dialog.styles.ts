import { SxProps, Theme } from '@mui/material';

export const dialogTitleStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const dialogContentStyles: SxProps<Theme> = {
  pt: 2,
};

export const searchFieldStyles: SxProps<Theme> = {
  mb: 2,
};

export const searchFilterSelectStyles: SxProps<Theme> = {
  minWidth: 100,
  fontSize: '0.875rem',
  '& .MuiSelect-select': {
    py: 0.5,
    pr: 3,
  },
};

export const cardsContainerStyles: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, 1fr)',
    sm: 'repeat(3, 1fr)',
    md: 'repeat(5, 1fr)',
  },
  gap: 2,
  minHeight: 200,
  maxHeight: '60vh',
  overflowY: 'auto',
};

export const noBooksTextStyles: SxProps<Theme> = {
  textAlign: 'center',
  py: 4,
};

export const cardStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #ddd',
  borderRadius: 1,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: 3,
  },
};

export const getCardStyles = (isSelected: boolean): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  border: isSelected ? '2px solid #4caf50' : '1px solid #ddd',
  borderRadius: 1,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, border 0.2s',
  '&:hover': {
    boxShadow: 3,
  },
});

export const cardImageContainerStyles: SxProps<Theme> = {
  width: '100%',
  height: 250,
  flexShrink: 0,
};

export const cardImageStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

export const cardBodyStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  p: 1.5,
  flex: 1,
};

export const cardTitleStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  fontSize: '0.875rem',
  mb: 0.5,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

export const cardAuthorStyles: SxProps<Theme> = {
  fontSize: '0.75rem',
  color: 'text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const actionsContainerStyles: SxProps<Theme> = {
  justifyContent: 'flex-start',
  px: 2,
  pb: 2,
  gap: 1,
};

export const randomButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};

export const closeButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};

export const confirmSelectedButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
};

export const cardSelectedStyles: SxProps<Theme> = {
  border: '2px solid #4caf50',
};

export const spacerBoxStyles: SxProps<Theme> = {
  flex: 1,
};
