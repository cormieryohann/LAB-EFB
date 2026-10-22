import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useVerifyApiKey } from '../hooks/api/useVerifyApiKey';
import { useApiKeyStore } from '../stores/useApiKeyStore';

const API_KEY_PREFIX = 'sk-ant-';
const CONSOLE_KEYS_URL = 'https://console.anthropic.com/settings/keys';

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps): React.JSX.Element {
  const savedApiKey = useApiKeyStore((state) => state.apiKey);
  const remembered = useApiKeyStore((state) => state.remembered);
  const saveApiKey = useApiKeyStore((state) => state.saveApiKey);
  const clearApiKey = useApiKeyStore((state) => state.clearApiKey);
  const verification = useVerifyApiKey();

  const [apiKey, setApiKey] = useState(savedApiKey ?? '');
  const [remember, setRemember] = useState(remembered);
  const [showKey, setShowKey] = useState(false);

  const trimmedKey = apiKey.trim();
  const formatError =
    trimmedKey.length > 0 && !trimmedKey.startsWith(API_KEY_PREFIX)
      ? `Une clé Anthropic commence par « ${API_KEY_PREFIX} ».`
      : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    verification.mutate(trimmedKey, {
      onSuccess: () => {
        saveApiKey(trimmedKey, remember);
        onClose();
      },
    });
  };

  const handleRemove = (): void => {
    clearApiKey();
    setApiKey('');
    verification.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Clé API Claude</DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              La pré-analyse est réalisée par Claude, l’IA d’Anthropic. Collez votre clé API, que
              vous pouvez créer depuis la{' '}
              <Link href={CONSOLE_KEYS_URL} target="_blank" rel="noopener noreferrer">
                console Anthropic
              </Link>
              .
            </DialogContentText>
            <TextField
              label="Clé API"
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                verification.reset();
              }}
              type={showKey ? 'text' : 'password'}
              placeholder={`${API_KEY_PREFIX}…`}
              autoComplete="off"
              autoFocus
              fullWidth
              error={formatError !== undefined}
              helperText={formatError}
              slotProps={{
                htmlInput: { spellCheck: false },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showKey ? 'Masquer la clé' : 'Afficher la clé'}
                        onClick={() => setShowKey((shown) => !shown)}
                        edge="end"
                      >
                        {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
              }
              label="Se souvenir de la clé sur cet appareil"
            />
            {verification.isError && <Alert severity="error">{verification.error.message}</Alert>}
            <Alert severity="info">
              La clé reste dans votre navigateur et n’est envoyée qu’à Anthropic. Sans la case
              ci-dessus, elle est effacée à la fermeture de l’onglet.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {savedApiKey !== null && (
            <Button color="error" onClick={handleRemove} sx={{ mr: 'auto' }}>
              Supprimer la clé
            </Button>
          )}
          <Button color="inherit" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={verification.isPending}
            disabled={trimmedKey.length === 0 || formatError !== undefined}
          >
            Vérifier et enregistrer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
