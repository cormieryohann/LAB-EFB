import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { LegalPath } from '../stores/useLawyerReviewStore';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { retainedClauses } from '../utils/retainedClauses';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';

interface CaseTrackerProps {
  analysis: ContractAnalysis;
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

const NEXT_STEP: Record<LegalPath | 'pending', { title: string; text: string }> = {
  pending: {
    title: 'Votre avocat prépare la suite',
    text: 'D’abord un accord avec la banque ; la justice seulement si besoin.',
  },
  amicable: {
    title: 'Discussion avec la banque en cours',
    text: 'Votre avocat écrit à la banque pour trouver un accord, sans procès.',
  },
  litigation: {
    title: 'Action en justice en préparation',
    text: 'Votre avocat vous défend devant le juge. Comptez 12 à 24 mois.',
  },
};

/** Suivi du dossier côté client : il reflète l'avancement de l'avocat sans donner accès à son espace. */
export function CaseTracker({ analysis }: CaseTrackerProps): React.JSX.Element {
  const reviews = useLawyerReviewStore((state) => state.reviews);
  const lawyerName = useLawyerReviewStore((state) => state.lawyerName);
  const conclusion = useLawyerReviewStore((state) => state.conclusion);
  const validatedAt = useLawyerReviewStore((state) => state.validatedAt);
  const path = useLawyerReviewStore((state) => state.path);

  const retained = retainedClauses(sortClausesByStrength(analysis.clauses), reviews);
  const nextStep = NEXT_STEP[path ?? 'pending'];

  return (
    <Paper
      component="section"
      aria-labelledby="case-tracker-title"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2}>
        <Typography id="case-tracker-title" variant="h5" component="h2">
          Suivi de votre dossier
        </Typography>

        {validatedAt === undefined ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <HourglassEmptyIcon color="action" />
            <Typography>
              Un avocat relit votre pré-analyse. Son avis s’affichera ici : c’est lui qui compte,
              pas celui de l’IA.
            </Typography>
          </Stack>
        ) : (
          <>
            <Alert severity="success">
              {lawyerName.trim()} a validé votre pré-analyse le{' '}
              {dateFormatter.format(new Date(validatedAt))}.
            </Alert>

            {retained.length > 0 && (
              <Box>
                <Typography variant="subtitle2" component="h3" gutterBottom>
                  {retained.length === 1
                    ? 'Le point retenu par votre avocat'
                    : `Les ${retained.length} points retenus par votre avocat`}
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 3 }}>
                  {retained.map(({ clause }) => (
                    <li key={`${clause.documentName}-${clause.title}`}>
                      <Typography>{clause.title}</Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            )}

            {conclusion.trim().length > 0 && (
              <Box>
                <Typography variant="subtitle2" component="h3" gutterBottom>
                  Le mot de votre avocat
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{conclusion}</Typography>
              </Box>
            )}

            {retained.length === 0 ? (
              <Alert severity="info">
                Votre avocat n’a rien retenu : aucune démarche n’est nécessaire.
              </Alert>
            ) : (
              <Alert severity="info">
                <strong>{nextStep.title}.</strong> {nextStep.text}
              </Alert>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
