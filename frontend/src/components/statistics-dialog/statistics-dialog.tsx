import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Book } from '../../types';
import { t } from '../../i18n';
import { useStatisticsDialog } from './statistics-dialog.hooks';
import * as styles from './statistics-dialog.styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface StatisticsDialogProps {
  open: boolean;
  onClose: () => void;
  books: Book[];
}

const StatisticsDialog: React.FC<StatisticsDialogProps> = ({
  open,
  onClose,
  books,
}) => {
  const { chartData, chartOptions, toggleMode, modeButtonText } = useStatisticsDialog(books);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={styles.dialogTitleStyles}>
        <Button onClick={toggleMode} sx={styles.modeButtonStyles}>
          {modeButtonText}
        </Button>
        <Box sx={styles.titleTextStyles}>{t('dialogs.statistics.title')}</Box>
        <Button onClick={onClose} sx={styles.closeButtonStyles}>
          ✕
        </Button>
      </DialogTitle>
      <DialogContent sx={styles.dialogContentStyles}>
        {chartData && chartOptions && (
          <Box sx={styles.chartContainerStyles}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={styles.dialogActionsStyles}>
        <Button onClick={onClose} sx={styles.closeTextButtonStyles}>
          {t('dialogs.statistics.closeButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatisticsDialog;
