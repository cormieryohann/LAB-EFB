import { createTheme } from '@mui/material/styles';

/** Charte des slides du pitch : brun profond, ambre, or et fond crème, titres en serif. */
const BROWN = '#2e1c0f';
const AMBER = '#e9a23b';
const GOLD = '#f2c65a';
const RUST = '#a6521a';
const CREAM = '#fdf3d8';
const SAND = '#ebddbf';

// Polices système : aucune requête vers un service de polices tiers.
const SERIF = 'Georgia, Cambria, "Times New Roman", Times, serif';

export const theme = createTheme({
  palette: {
    primary: { main: BROWN, contrastText: '#ffffff' },
    secondary: { main: AMBER, light: GOLD, dark: RUST, contrastText: BROWN },
    // Les encadrés d'information prennent un ocre de la charte plutôt que le bleu par défaut.
    info: { main: '#8a6a3b' },
    background: { default: CREAM, paper: '#ffffff' },
    text: { primary: BROWN, secondary: '#6b5440' },
    divider: SAND,
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: SERIF,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    overline: { fontWeight: 700, letterSpacing: '0.25em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { borderBottom: `4px solid ${AMBER}` } },
    },
    MuiPaper: {
      styleOverrides: { outlined: { borderColor: SAND } },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: SAND,
          '& .MuiStepIcon-text': { fill: '#6b5440' },
          '&.Mui-active': { color: AMBER },
          '&.Mui-active .MuiStepIcon-text': { fill: BROWN },
          '&.Mui-completed': { color: BROWN },
        },
        text: { fontFamily: SERIF, fontWeight: 700 },
      },
    },
  },
});
