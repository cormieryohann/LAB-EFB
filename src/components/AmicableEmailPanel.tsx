import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BalanceIcon from '@mui/icons-material/Balance';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useDraftAmicableEmail } from '../hooks/api/useDraftAmicableEmail';
import { useClipboard } from '../hooks/useClipboard';
import { useAmicableEmailStore } from '../stores/useAmicableEmailStore';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { EmailRecipient } from '../types/amicableEmail';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { findPlaceholders } from '../utils/findPlaceholders';
import { retainedClauses } from '../utils/retainedClauses';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';

interface AmicableEmailPanelProps {
  analysis: ContractAnalysis;
  onBack: () => void;
  /** L'amiable a échoué : passage à la procédure contentieuse. */
  onLitigation: () => void;
}

function mailtoHref(address: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encode les espaces en « + », que les messageries affichent tels quels.
  return `mailto:${encodeURIComponent(address.trim())}?${params.toString().replace(/\+/g, '%20')}`;
}

export function AmicableEmailPanel({
  analysis,
  onBack,
  onLitigation,
}: AmicableEmailPanelProps): React.JSX.Element {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  const reviews = useLawyerReviewStore((state) => state.reviews);
  const lawyerName = useLawyerReviewStore((state) => state.lawyerName);
  const conclusion = useLawyerReviewStore((state) => state.conclusion);
  const recipient = useAmicableEmailStore((state) => state.recipient);
  const recipientAddress = useAmicableEmailStore((state) => state.recipientAddress);
  const draft = useAmicableEmailStore((state) => state.draft);
  const setRecipient = useAmicableEmailStore((state) => state.setRecipient);
  const setRecipientAddress = useAmicableEmailStore((state) => state.setRecipientAddress);
  const setDraft = useAmicableEmailStore((state) => state.setDraft);
  const updateDraft = useAmicableEmailStore((state) => state.updateDraft);
  const drafting = useDraftAmicableEmail();
  const clipboard = useClipboard('Mail copié dans le presse-papiers');

  const retained = retainedClauses(sortClausesByStrength(analysis.clauses), reviews);
  const placeholders = draft === undefined ? [] : findPlaceholders(draft.body);

  const generate = (): void => {
    if (apiKey === null) return;
    drafting.mutate(
      {
        apiKey,
        input: {
          recipient,
          lawyerName,
          conclusion,
          summary: analysis.summary,
          retainedClauses: retained,
        },
      },
      { onSuccess: setDraft },
    );
  };

  return (
    <Stack component="section" aria-labelledby="amicable-title" spacing={3}>
      <Box>
        <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={onBack} sx={{ mb: 1 }}>
          Revenir à la validation
        </Button>
        <Typography id="amicable-title" variant="h4" component="h2" gutterBottom>
          Démarche amiable : le mail
        </Typography>
        <Typography color="text.secondary">
          L’IA rédige le mail à partir des {retained.length} clause{retained.length > 1 ? 's' : ''}{' '}
          retenue{retained.length > 1 ? 's' : ''} et de votre conclusion. Relisez-le et complétez-le
          avant de l’envoyer.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" component="h3">
            Destinataire
          </Typography>
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={recipient}
            onChange={(_event, value: EmailRecipient | null) => {
              if (value !== null) setRecipient(value);
            }}
            aria-label="Destinataire du mail"
          >
            <ToggleButton value="banque">Banque (service réclamations)</ToggleButton>
            <ToggleButton value="mediateur">Médiateur bancaire</ToggleButton>
          </ToggleButtonGroup>
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
              {draft === undefined ? 'Rédiger le mail avec l’IA' : 'Rédiger à nouveau'}
            </Button>
          </Box>
          {apiKey === null && (
            <Alert severity="info">
              Ajoutez votre clé Claude (en haut à droite) pour rédiger le mail.
            </Alert>
          )}
          {drafting.isPending && (
            <Box role="status">
              <LinearProgress />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Claude rédige le mail…
              </Typography>
            </Box>
          )}
          {drafting.isError && <Alert severity="error">{drafting.error.message}</Alert>}
        </Stack>
      </Paper>

      {draft !== undefined && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" component="h3">
              Mail à envoyer
            </Typography>
            <TextField
              label="Adresse du destinataire"
              type="email"
              placeholder={
                recipient === 'banque' ? 'reclamations@banque.fr' : 'mediateur@banque.fr'
              }
              value={recipientAddress}
              onChange={(event) => setRecipientAddress(event.target.value)}
              fullWidth
            />
            <TextField
              label="Objet"
              value={draft.subject}
              onChange={(event) => updateDraft({ subject: event.target.value })}
              fullWidth
            />
            <TextField
              label="Message"
              value={draft.body}
              onChange={(event) => updateDraft({ body: event.target.value })}
              multiline
              minRows={12}
              fullWidth
            />
            {placeholders.length > 0 && (
              <Alert severity="warning">
                À compléter avant l’envoi : {placeholders.join(', ')}
              </Alert>
            )}
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                href={mailtoHref(recipientAddress, draft.subject, draft.body)}
              >
                Ouvrir dans ma messagerie
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => void clipboard.copy(`Objet : ${draft.subject}\n\n${draft.body}`)}
              >
                Copier le mail
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Button color="inherit" startIcon={<BalanceIcon />} onClick={onLitigation}>
          L’amiable a échoué : passer au contentieux
        </Button>
      </Box>

      <Snackbar
        open={clipboard.message !== undefined}
        autoHideDuration={3000}
        onClose={clipboard.clearMessage}
        message={clipboard.message}
      />
    </Stack>
  );
}
