import GavelIcon from '@mui/icons-material/Gavel';
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiKeyButton } from './components/ApiKeyButton';
import { UploadPage } from './pages/UploadPage';
import { theme } from './theme/theme';

const queryClient = new QueryClient();

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <GavelIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              VIGICONTRAT
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <ApiKeyButton />
          </Toolbar>
        </AppBar>
        <main>
          <UploadPage />
        </main>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
