import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDraftLitigationBrief } from '../hooks/api/useDraftLitigationBrief';
import { useClipboard } from '../hooks/useClipboard';
import { useAmicableEmailStore } from '../stores/useAmicableEmailStore';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { useLitigationStore } from '../stores/useLitigationStore';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { downloadTextFile } from '../utils/downloadTextFile';
import { findPlaceholders } from '../utils/findPlaceholders';
import { retainedClauses } from '../utils/retainedClauses';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';

interface LitigationPanelProps {
  analysis: ContractAnalysis;
  onBack: () => void;
}

export function LitigationPanel({ analysis, onBack }: LitigationPanelProps): React.JSX.Element {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  const documents = useDocumentStore((state) => state.documents);
  const reviews = useLawyerReviewStore((state) => state.reviews);
  const lawyerName = useLawyerReviewStore((state) => state.lawyerName);
  const conclusion = useLawyerReviewStore((state) => state.conclusion);
  const amicableEmail = useAmicableEmailStore((state) => state.draft);
  const amicableOutcome = useLitigationStore((state) => state.amicableOutcome);
  const draft = useLitigationStore((state) => state.draft);
  const setAmicableOutcome = useLitigationStore((state) => state.setAmicableOutcome);
  const setDraft = useLitigationStore((state) => state.setDraft);
  const updateDraft = useLitigationStore((state) => state.updateDraft);
  const drafting = useDraftLitigationBrief();
  const clipboard = useClipboard('Projet d’acte copié dans le presse-papiers');

  const retained = retainedClauses(sortClausesByStrength(analysis.clauses), reviews);
  const exhibits = [
    ...documents
      .filter((document) => document.status === 'ready')
      .map((document) => `Contrat et annexes : ${document.fileName}`),
    ...(amicableEmail === undefined
      ? []
      : [`Mail de réclamation amiable : « ${amicableEmail.subject} »`]),
    ...(amicableOutcome.trim().length > 0 ? ['Réponse à la démarche amiable'] : []),
  ];
  const placeholders = draft === undefined ? [] : findPlaceholders(draft.body);

  const generate = (): void => {
    if (apiKey === null) return;
    drafting.mutate(
      {
        apiKey,
        input: {
          lawyerName,
          conclusion,
          summary: analysis.summary,
          retainedClauses: retained,
          exhibits,
          amicableEmail,
          amicableOutcome,
        },
      },
      { onSuccess: setDraft },
    );
  };

  return (
    <Stack component="section" aria-labelledby="litigation-title" spacing={3}>
      <Box>
        <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={onBack} sx={{ mb: 1 }}>
          Revenir à l’étape précédente
        </Button>
        <Typography id="litigation-title" variant="h4" component="h2" gutterBottom>
          Procédure contentieuse : le dossier
        </Typography>
        <Typography color="text.secondary">
          L’IA prépare un projet d’assignation à partir des {retained.length} clause
          {retained.length > 1 ? 's' : ''} retenue{retained.length > 1 ? 's' : ''}. L’avocat
          détermine la juridiction, vérifie les mentions obligatoires et les montants avant toute
          signification.
        </Typography>
      </Box>

      {amicableEmail === undefined && (
        <Alert severity="warning">
          Aucune démarche amiable n’a été préparée. Pour un litige de moins de 5 000 €, une
          tentative de résolution amiable est obligatoire avant de saisir le juge.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <TextField
            label="Résultat de la démarche amiable (facultatif)"
            placeholder="Ex. : refus de la banque par courrier du 12 septembre, au motif que…"
            value={amicableOutcome}
            onChange={(event) => setAmicableOutcome(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Box>
            <Typography variant="subtitle2" component="h3" gutterBottom>
              Bordereau de pièces
            </Typography>
            <Box component="ol" aria-label="Bordereau de pièces" sx={{ m: 0, pl: 3 }}>
              {exhibits.map((exhibit) => (
                <li key={exhibit}>
                  <Typography>{exhibit}</Typography>
                </li>
              ))}
            </Box>
          </Box>
          <Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<EditNoteIcon />}
              onClick={generate}
              loading={drafting.isPending}
              loadingPosition="start"
              disabled={apiKey === null}
            >
              {draft === undefined ? 'Rédiger le projet d’assignation' : 'Rédiger à nouveau'}
            </Button>
          </Box>
          {apiKey === null && (
            <Alert severity="info">
              Ajoutez votre clé Claude (en haut à droite) pour rédiger le projet d’acte.
            </Alert>
          )}
          {drafting.isPending && (
            <Box role="status">
              <LinearProgress />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Claude rédige le projet d’assignation. Comptez une à deux minutes.
              </Typography>
            </Box>
          )}
          {drafting.isError && <Alert severity="error">{drafting.error.message}</Alert>}
        </Stack>
      </Paper>

      {draft !== undefined && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <TextField
              label="Intitulé"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              fullWidth
            />
            <TextField
              label="Projet d’acte"
              value={draft.body}
              onChange={(event) => updateDraft({ body: event.target.value })}
              multiline
              minRows={16}
              fullWidth
            />
            {placeholders.length > 0 && (
              <Alert severity="warning">À compléter : {placeholders.join(', ')}</Alert>
            )}
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  downloadTextFile('projet-assignation.txt', `${draft.title}\n\n${draft.body}`)
                }
              >
                Télécharger (.txt)
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => void clipboard.copy(`${draft.title}\n\n${draft.body}`)}
              >
                Copier le projet
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={clipboard.message !== undefined}
        autoHideDuration={3000}
        onClose={clipboard.clearMessage}
        message={clipboard.message}
      />
    </Stack>
  );
}
