import { SxProps, Theme } from '@mui/material';

export const labelStyles: SxProps<Theme> = {
  color: 'text.secondary',
  mb: 1,
};

export const zoneStyles = (dragging: boolean, error: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minHeight: 120,
  p: 2,
  border: 2,
  borderStyle: 'dashed',
  borderRadius: 1,
  borderColor: dragging ? 'secondary.main' : error ? 'error.main' : 'divider',
  bgcolor: dragging ? 'action.hover' : 'transparent',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: 2,
    outlineColor: 'secondary.main',
  },
});

// Same 2:3 shape as the covers elsewhere on the page
export const previewStyles: SxProps<Theme> = {
  width: 80,
  height: 120,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: 0.5,
};

export const removeButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  mt: 0.5,
};

export const errorStyles: SxProps<Theme> = {
  mt: 0.5,
};
