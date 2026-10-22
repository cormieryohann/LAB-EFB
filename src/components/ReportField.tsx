import { Box, Typography } from '@mui/material';

interface ReportFieldProps {
  label: string;
  children: string;
}

export function ReportField({ label, children }: ReportFieldProps): React.JSX.Element {
  return (
    <Box>
      <Typography variant="subtitle2" component="h5">
        {label}
      </Typography>
      <Typography>{children}</Typography>
    </Box>
  );
}
