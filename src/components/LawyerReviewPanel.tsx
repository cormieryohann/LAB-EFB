import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { LAWYER_DECISION_DISPLAY, LAWYER_DECISIONS } from '../constants/lawyerDecisions';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { LawyerDecision } from '../stores/useLawyerReviewStore';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';
import { CaseDetailsCard } from './CaseDetailsCard';
import { ClauseCard } from './ClauseCard';
import { LawyerValidationSummary } from './LawyerValidationSummary';

interface LawyerReviewPanelProps {
  analysis: ContractAnalysis;
  /** Choix de la voie après validation : démarche amiable ou procédure contentieuse. */
  onChoosePath: (path: 'amicable' | 'litigation') => void;
}

function ClauseDecision({ clauseIndex }: { clauseIndex: number }): React.JSX.Element {
  const review = useLawyerReviewStore((state) => state.reviews[clauseIndex]);
  const setDecision = useLawyerReviewStore((state) => state.setDecision);
  const setNote = useLawyerReviewStore((state) => state.setNote);

  return (
    <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle2" component="h5" gutterBottom>
        Avis de l’avocat
      </Typography>
      <Stack spacing={1.5}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={review?.decision ?? null}
          onChange={(_event, decision: LawyerDecision | null) => {
            if (decision !== null) setDecision(clauseIndex, decision);
          }}
          aria-label={`Décision pour la clause ${clauseIndex + 1}`}
        >
          {LAWYER_DECISIONS.map((decision) => (
            <ToggleButton
              key={decision}
              value={decision}
              color={LAWYER_DECISION_DISPLAY[decision].buttonColor}
            >
              {LAWYER_DECISION_DISPLAY[decision].action}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          label="Note de l’avocat (facultatif)"
          value={review?.note ?? ''}
          onChange={(event) => setNote(clauseIndex, event.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Stack>
    </Box>
  );
}

/** Abonné à part : la saisie du nom ou de la conclusion ne redessine pas les cartes des clauses. */
function ConfirmValidationForm({ clauseCount }: { clauseCount: number }): React.JSX.Element {
  const pendingCount = useLawyerReviewStore(
    (state) =>
      Array.from({ length: clauseCount }).filter(
        (_clause, index) => state.reviews[index]?.decision === undefined,
      ).length,
  );
  const lawyerName = useLawyerReviewStore((state) => state.lawyerName);
  const conclusion = useLawyerReviewStore((state) => state.conclusion);
  const setLawyerName = useLawyerReviewStore((state) => state.setLawyerName);
  const setConclusion = useLawyerReviewStore((state) => state.setConclusion);
  const confirmValidation = useLawyerReviewStore((state) => state.confirmValidation);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h3">
          Confirmer la validation
        </Typography>
        <TextField
          label="Avocat en charge du dossier"
          placeholder="Me Dupont"
          value={lawyerName}
          onChange={(event) => setLawyerName(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Conclusion pour le client (facultatif)"
          value={conclusion}
          onChange={(event) => setConclusion(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        {pendingCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            {pendingCount === 1
              ? 'Il reste 1 clause sans avis.'
              : `Il reste ${pendingCount} clauses sans avis.`}
          </Typography>
        )}
        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={confirmValidation}
            disabled={pendingCount > 0 || lawyerName.trim().length === 0}
          >
            Confirmer la validation
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export function LawyerReviewPanel({
  analysis,
  onChoosePath,
}: LawyerReviewPanelProps): React.JSX.Element {
  const clauses = sortClausesByStrength(analysis.clauses);
  const isValidated = useLawyerReviewStore((state) => state.validatedAt !== undefined);

  return (
    <Stack component="section" aria-labelledby="lawyer-review-title" spacing={3}>
      <Box>
        <Typography id="lawyer-review-title" variant="h4" component="h2" gutterBottom>
          Espace avocat : validation de la pré-analyse
        </Typography>
        <Typography color="text.secondary">
          L’IA au service de l’avocat, jamais à sa place : chaque clause repérée doit être validée,
          approfondie ou écartée avant toute démarche auprès de la banque.
        </Typography>
      </Box>

      {isValidated ? (
        <LawyerValidationSummary clauses={clauses} onChoosePath={onChoosePath} />
      ) : (
        <>
          <Alert severity="warning">
            <AlertTitle>Rien n’est acquis avant votre validation</AlertTitle>
            L’IA peut se tromper : clause oubliée, extrait mal recopié, montant ou fondement
            inexact. Contrôlez chaque extrait sur le contrat original.
          </Alert>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle2" component="h3" gutterBottom>
              Synthèse de l’IA (non vérifiée)
            </Typography>
            <Typography>{analysis.summary}</Typography>
          </Paper>

          <CaseDetailsCard details={analysis.caseDetails} />

          {clauses.length === 0 ? (
            <Alert severity="info">
              L’IA n’a repéré aucune clause contestable, ce qui ne prouve pas qu’il n’y en a pas.
              Relisez le contrat, puis indiquez votre conclusion ci-dessous.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {clauses.map((clause, index) => (
                <ClauseCard key={`${clause.documentName}-${clause.title}`} clause={clause}>
                  <ClauseDecision clauseIndex={index} />
                </ClauseCard>
              ))}
            </Stack>
          )}

          <ConfirmValidationForm clauseCount={clauses.length} />
        </>
      )}
    </Stack>
  );
}
