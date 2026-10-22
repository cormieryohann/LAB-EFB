import BalanceIcon from '@mui/icons-material/Balance';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { LAWYER_DECISION_DISPLAY } from '../constants/lawyerDecisions';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { Clause } from '../types/contractAnalysis';
import { retainedClauses } from '../utils/retainedClauses';

interface LawyerValidationSummaryProps {
  /** Clauses dans l'ordre du rapport trié : leur position est la clé des avis de l'avocat. */
  clauses: Clause[];
  onChoosePath: (path: 'amicable' | 'litigation') => void;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });

export function LawyerValidationSummary({
  clauses,
  onChoosePath,
}: LawyerValidationSummaryProps): React.JSX.Element {
  const reviews = useLawyerReviewStore((state) => state.reviews);
  const lawyerName = useLawyerReviewStore((state) => state.lawyerName);
  const conclusion = useLawyerReviewStore((state) => state.conclusion);
  const validatedAt = useLawyerReviewStore((state) => state.validatedAt);
  const reopenValidation = useLawyerReviewStore((state) => state.reopenValidation);

  const retained = retainedClauses(clauses, reviews);
  const discardedCount = clauses.length - retained.length;

  return (
    <Stack spacing={3}>
      <Alert severity="success">
        Pré-analyse validée par {lawyerName.trim()}
        {validatedAt !== undefined && ` le ${dateFormatter.format(new Date(validatedAt))}`}.
      </Alert>

      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          {retained.length === 0
            ? 'Aucune clause retenue'
            : `${retained.length} clause${retained.length > 1 ? 's' : ''} retenue${retained.length > 1 ? 's' : ''}`}
          {discardedCount > 0 && ` · ${discardedCount} écartée${discardedCount > 1 ? 's' : ''}`}
        </Typography>
        <Stack spacing={1.5}>
          {retained.map(({ clause, decision, note }) => (
            <Paper key={`${clause.documentName}-${clause.title}`} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Chip
                  size="small"
                  color={LAWYER_DECISION_DISPLAY[decision].chipColor}
                  label={LAWYER_DECISION_DISPLAY[decision].outcome}
                />
                <Typography sx={{ fontWeight: 500 }}>{clause.title}</Typography>
              </Stack>
              {note.trim().length > 0 && <Typography color="text.secondary">{note}</Typography>}
            </Paper>
          ))}
        </Stack>
      </Box>

      {conclusion.trim().length > 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle2" component="h3" gutterBottom>
            Conclusion de l’avocat
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{conclusion}</Typography>
        </Paper>
      )}

      {retained.length === 0 ? (
        <Alert severity="info">
          Aucune clause n’est retenue : il n’y a pas de démarche à engager auprès de la banque.
        </Alert>
      ) : (
        <Alert severity="info">
          Prochaine étape : choisissez la voie. L’amiable passe en priorité (obligatoire pour un
          litige de moins de 5 000 €) ; le contentieux s’impose en cas d’urgence, par exemple une
          saisie en cours.
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Button color="inherit" onClick={reopenValidation}>
          Modifier la validation
        </Button>
        {retained.length > 0 && (
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ForwardToInboxIcon />}
              onClick={() => onChoosePath('amicable')}
            >
              Rédiger le mail amiable
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<BalanceIcon />}
              onClick={() => onChoosePath('litigation')}
            >
              Passer au contentieux
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
