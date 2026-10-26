import { Alert, AlertTitle, Box, Paper, Stack, Typography } from '@mui/material';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';
import { ClauseCard } from './ClauseCard';
import { ReportField } from './ReportField';

interface AnalysisReportProps {
  analysis: ContractAnalysis;
}

/** Rapport côté client : l'essentiel, sans le détail juridique réservé à l'avocat. */
export function AnalysisReport({ analysis }: AnalysisReportProps): React.JSX.Element {
  const clauses = sortClausesByStrength(analysis.clauses);
  const reviews = useLawyerReviewStore((state) => state.reviews);
  const isValidated = useLawyerReviewStore((state) => state.validatedAt !== undefined);

  return (
    <Stack component="section" aria-labelledby="report-title" spacing={3}>
      <Box>
        <Typography id="report-title" variant="h5" component="h2" gutterBottom>
          Rapport de pré-analyse
        </Typography>
        {isValidated ? (
          <Alert severity="success">
            <AlertTitle>Votre avocat a vérifié ce rapport</AlertTitle>
            Son avis compte plus que celui de l’IA : il est indiqué sur chaque point ci-dessous.
          </Alert>
        ) : (
          <Alert severity="warning">
            <AlertTitle>L’IA peut se tromper</AlertTitle>
            Elle peut oublier une clause ou mal lire un chiffre. Seul un avocat peut vous dire ce
            qui est vrai. Attendez son avis avant toute démarche, et continuez à payer vos
            échéances.
          </Alert>
        )}
      </Box>

      <Typography>{analysis.summary}</Typography>

      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          {clauses.length === 0
            ? 'Aucune clause contestable repérée'
            : `${clauses.length} clause${clauses.length > 1 ? 's' : ''} contestable${clauses.length > 1 ? 's' : ''}`}
        </Typography>
        {clauses.length === 0 ? (
          <Alert severity="info">
            L’IA n’a rien repéré, mais elle a pu passer à côté. Un avocat vérifie votre dossier.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {clauses.map((clause, index) => (
              <ClauseCard
                key={`${clause.documentName}-${clause.title}`}
                clause={clause}
                variant="client"
                lawyerDecision={isValidated ? reviews[index]?.decision : undefined}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <ReportField label="Que risquez-vous ?">{analysis.risks}</ReportField>
          <ReportField label="En combien de temps ?">{analysis.timeline}</ReportField>
          {analysis.missingInformation.length > 0 && (
            <Box>
              <Typography variant="subtitle2" component="h5">
                Documents utiles à votre avocat
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 3 }}>
                {analysis.missingInformation.map((item) => (
                  <li key={item}>
                    <Typography>{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Pré-analyse faite par une IA, pas un avis juridique. Seul votre avocat peut confirmer vos
        droits ; seul un juge peut déclarer une clause abusive.
      </Typography>
    </Stack>
  );
}
