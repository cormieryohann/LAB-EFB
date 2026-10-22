import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#1d3a6e' },
    secondary: { main: '#c8902e' },
    background: { default: '#f5f7fb' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h3: { fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
});
