import { Box, Paper, Stack, Typography } from '@mui/material';
import { caseDetailLines } from '../constants/caseDetailsLabels';
import type { CaseDetails } from '../types/contractAnalysis';

interface CaseDetailsCardProps {
  details: CaseDetails;
}

/** Informations extraites par l'IA, montrées à l'avocat avant qu'elles partent dans un courrier. */
export function CaseDetailsCard({ details }: CaseDetailsCardProps): React.JSX.Element {
  const lines = caseDetailLines(details);

  return (
    <Paper
      component="section"
      aria-labelledby="case-details-title"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={1.5}>
        <Box>
          <Typography id="case-details-title" variant="subtitle2" component="h3">
            Informations du dossier (extraites par l’IA)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reprises dans le mail et l’assignation : vérifiez-les sur le contrat.
          </Typography>
        </Box>
        {lines.length === 0 ? (
          <Typography>
            L’IA n’a trouvé aucune information sur les parties ni sur le prêt.
          </Typography>
        ) : (
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'max-content 1fr' },
              columnGap: 2,
              rowGap: 0.5,
            }}
          >
            {lines.map(({ label, value }, index) => (
              <Box key={`${label}-${index}`} sx={{ display: 'contents' }}>
                <Typography component="dt" color="text.secondary">
                  {label}
                </Typography>
                <Typography component="dd" sx={{ m: 0 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
