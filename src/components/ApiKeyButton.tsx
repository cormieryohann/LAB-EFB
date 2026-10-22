import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { ApiKeyDialog } from './ApiKeyDialog';

export function ApiKeyButton(): React.JSX.Element {
  const hasApiKey = useApiKeyStore((state) => state.apiKey !== null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        color="inherit"
        variant="outlined"
        startIcon={hasApiKey ? <CheckCircleIcon color="success" /> : <KeyIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
      >
        {hasApiKey ? 'Clé Claude active' : 'Ajouter ma clé Claude'}
      </Button>
      {/* Démonté à la fermeture : le formulaire repart de la clé enregistrée à chaque ouverture. */}
      {dialogOpen && <ApiKeyDialog open onClose={() => setDialogOpen(false)} />}
    </>
  );
}
