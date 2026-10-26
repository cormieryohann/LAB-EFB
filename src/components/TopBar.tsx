import GavelIcon from '@mui/icons-material/Gavel';
import { AppBar, Box, Stack, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ApiKeyButton } from './ApiKeyButton';

interface TopBarProps {
  /** Actions propres à la page, placées avant le bouton de la clé Claude. */
  children?: ReactNode;
}

export function TopBar({ children }: TopBarProps): React.JSX.Element {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <GavelIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
        <Typography
          variant="h6"
          component="span"
          sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.2em' }}
        >
          VIGICONTRAT
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5}>
          {children}
          <ApiKeyButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
