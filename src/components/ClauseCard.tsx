import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CLAUSE_CATEGORY_LABELS, CLAUSE_STRENGTH_DISPLAY } from '../constants/clauseLabels';
import type { Clause } from '../types/contractAnalysis';
import { ReportField } from './ReportField';

interface ClauseCardProps {
  clause: Clause;
  /** Contenu ajouté sous l'analyse, par exemple la décision de l'avocat. */
  children?: ReactNode;
}

export function ClauseCard({ clause, children }: ClauseCardProps): React.JSX.Element {
  const strength = CLAUSE_STRENGTH_DISPLAY[clause.strength];
  return (
    <Paper variant="outlined" component="article" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip size="small" color={strength.color} label={strength.label} />
          <Chip size="small" variant="outlined" label={CLAUSE_CATEGORY_LABELS[clause.category]} />
        </Stack>
        <Typography variant="h6" component="h4">
          {clause.title}
        </Typography>
        <Box
          component="blockquote"
          sx={{
            m: 0,
            pl: 2,
            borderLeft: 3,
            borderColor: 'secondary.main',
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          « {clause.excerpt} »
          <Typography variant="caption" component="footer" sx={{ display: 'block', mt: 0.5 }}>
            {clause.documentName}
          </Typography>
        </Box>
        <ReportField label="Pourquoi c’est contestable">{clause.explanation}</ReportField>
        <ReportField label="Ce que vous pourriez obtenir">{clause.potentialGain}</ReportField>
        <ReportField label="Fondement">{clause.legalBasis}</ReportField>
        {children}
      </Stack>
    </Paper>
  );
}
