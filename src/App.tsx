import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UploadPage } from './pages/UploadPage';
import { theme } from './theme/theme';

const queryClient = new QueryClient();

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UploadPage />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
