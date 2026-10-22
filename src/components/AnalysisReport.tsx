import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { sortClausesByStrength } from '../utils/sortClausesByStrength';
import { ClauseCard } from './ClauseCard';
import { ReportField } from './ReportField';

interface AnalysisReportProps {
  analysis: ContractAnalysis;
}

export function AnalysisReport({ analysis }: AnalysisReportProps): React.JSX.Element {
  const clauses = sortClausesByStrength(analysis.clauses);

  return (
    <Stack component="section" aria-labelledby="report-title" spacing={3}>
      <Box>
        <Typography id="report-title" variant="h5" component="h2" gutterBottom>
          Rapport de pré-analyse
        </Typography>
        <Typography>{analysis.summary}</Typography>
      </Box>

      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          {clauses.length === 0
            ? 'Aucune clause contestable repérée'
            : `${clauses.length} clause${clauses.length > 1 ? 's' : ''} contestable${clauses.length > 1 ? 's' : ''}`}
        </Typography>
        {clauses.length === 0 ? (
          <Alert severity="success">
            L’IA n’a pas repéré de clause contestable dans ces documents. Un avocat peut néanmoins
            vérifier votre dossier, notamment le calcul du TAEG.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {clauses.map((clause) => (
              <ClauseCard key={`${clause.documentName}-${clause.title}`} clause={clause} />
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
                Pour confirmer l’analyse
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

      <Alert severity="warning">
        Ceci est une pré-analyse produite par une IA, pas un avis juridique. Prochaine étape : un
        avocat spécialisé valide chaque point avant toute démarche.
      </Alert>
    </Stack>
  );
}
