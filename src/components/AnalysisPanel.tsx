import GavelIcon from '@mui/icons-material/Gavel';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { Alert, Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { ContractAnalysisState } from '../hooks/useContractAnalysis';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { AnalysisReport } from './AnalysisReport';
import { ApiKeyDialog } from './ApiKeyDialog';

interface AnalysisPanelProps {
  state: ContractAnalysisState;
  onRequestLawyerValidation: () => void;
}

export function AnalysisPanel({
  state,
  onRequestLawyerValidation,
}: AnalysisPanelProps): React.JSX.Element {
  const hasApiKey = useApiKeyStore((store) => store.apiKey !== null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { analysis, error, isPending, isStale, canLaunch, isReading, launch } = state;

  return (
    <Stack spacing={3}>
      {hasApiKey ? (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<ManageSearchIcon />}
            onClick={launch}
            loading={isPending}
            loadingPosition="start"
            disabled={!canLaunch}
          >
            {analysis === undefined ? 'Lancer la pré-analyse' : 'Relancer la pré-analyse'}
          </Button>
          {isReading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Lecture des fichiers en cours…
            </Typography>
          )}
        </Box>
      ) : (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => setApiKeyDialogOpen(true)}>
              Ajouter ma clé
            </Button>
          }
        >
          Ajoutez votre clé Claude pour lancer la pré-analyse.
        </Alert>
      )}

      {isPending && (
        <Box role="status">
          <LinearProgress color="secondary" />
          <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Claude lit vos documents et recherche les clauses contestables. Comptez une à deux
            minutes.
          </Typography>
        </Box>
      )}

      {error !== null && <Alert severity="error">{error.message}</Alert>}

      {isStale && (
        <Alert severity="info">
          Vos documents ont changé depuis cette analyse : relancez-la pour en tenir compte.
        </Alert>
      )}

      {analysis !== undefined && !isPending && (
        <>
          <AnalysisReport analysis={analysis} />
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GavelIcon />}
              onClick={onRequestLawyerValidation}
              disabled={isStale}
              sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Validation avocat
            </Button>
          </Box>
        </>
      )}

      {apiKeyDialogOpen && <ApiKeyDialog open onClose={() => setApiKeyDialogOpen(false)} />}
    </Stack>
  );
}
