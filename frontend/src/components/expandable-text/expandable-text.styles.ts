import { SxProps, Theme } from '@mui/material';

export const clampStyles = (lines: number): SxProps<Theme> => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const toggleButtonStyles: SxProps<Theme> = {
  px: 0,
  textTransform: 'none',
  fontWeight: 700,
};
