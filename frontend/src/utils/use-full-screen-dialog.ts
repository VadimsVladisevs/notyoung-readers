import { useMediaQuery, useTheme } from '@mui/material';

/** Big dialogs fill the screen on phones (below MUI `sm`). */
export const useFullScreenDialog = () => useMediaQuery(useTheme().breakpoints.down('sm'));
