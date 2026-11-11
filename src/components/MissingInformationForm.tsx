import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { CompletionAnswers } from '../types/documentCompletion';

interface MissingInformationFormProps {
  /** Champs laissés entre crochets par l'IA, crochets compris. */
  placeholders: string[];
  onComplete: (completion: CompletionAnswers) => void;
  loading: boolean;
  disabled: boolean;
  /** Erreur du dernier complément demandé. */
  error?: string;
}

/** « [Numéro du prêt] » devient « Numéro du prêt » pour l'étiquette du champ. */
function placeholderLabel(placeholder: string): string {
  return placeholder.slice(1, -1).trim();
}

/**
 * Informations que l'IA n'a pas trouvées dans le dossier : l'avocat renseigne celles qu'il
 * connaît, ajoute ses précisions, puis l'IA complète le document déjà rédigé.
 */
export function MissingInformationForm({
  placeholders,
  onComplete,
  loading,
  disabled,
  error,
}: MissingInformationFormProps): React.JSX.Element {
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const answers = placeholders
    .map((placeholder) => ({ placeholder, value: (values[placeholder] ?? '').trim() }))
    .filter(({ value }) => value.length > 0);
  const isEmpty = answers.length === 0 && notes.trim().length === 0;

  return (
    <Paper
      component="form"
      variant="outlined"
      aria-labelledby="missing-information-title"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        if (!isEmpty) onComplete({ answers, notes: notes.trim() });
      }}
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography id="missing-information-title" variant="h6" component="h3" gutterBottom>
            Informations à compléter
          </Typography>
          <Alert severity="warning">
            L’IA n’a pas trouvé {placeholders.length > 1 ? 'ces informations' : 'cette information'}{' '}
            dans le dossier. Renseignez ce que vous connaissez : l’IA l’intègre au document en
            gardant vos modifications. Un champ laissé vide reste entre crochets.
          </Alert>
        </Box>
        {placeholders.map((placeholder) => (
          <TextField
            key={placeholder}
            label={placeholderLabel(placeholder)}
            value={values[placeholder] ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, [placeholder]: event.target.value }))
            }
            fullWidth
          />
        ))}
        <TextField
          label="Précisions pour l’IA (facultatif)"
          placeholder="Ex. : la banque a répondu le 3 novembre en refusant tout geste ; insister sur les frais de recouvrement."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            loading={loading}
            loadingPosition="start"
            disabled={disabled || isEmpty}
          >
            Compléter le document avec l’IA
          </Button>
        </Box>
        {loading && (
          <Typography role="status" color="text.secondary">
            Claude complète le document…
          </Typography>
        )}
        {error !== undefined && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
