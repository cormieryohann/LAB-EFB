import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Chip, Collapse, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CLAUSE_CATEGORY_LABELS, CLAUSE_STRENGTH_DISPLAY } from '../constants/clauseLabels';
import { LAWYER_DECISION_DISPLAY } from '../constants/lawyerDecisions';
import type { LawyerDecision } from '../stores/useLawyerReviewStore';
import type { Clause } from '../types/contractAnalysis';
import { ReportField } from './ReportField';

interface ClauseCardProps {
  clause: Clause;
  /**
   * Le client ne voit que l'essentiel, en langage courant ; l'avocat voit aussi la catégorie et
   * le fondement juridique.
   */
  variant?: 'client' | 'lawyer';
  /**
   * Côté client : avis de l'avocat sur la clause, absent tant qu'il n'a pas validé. L'IA peut se
   * tromper, donc chaque clause affiche qu'elle attend sa confirmation.
   */
  lawyerDecision?: LawyerDecision;
  /** Contenu ajouté sous l'analyse, par exemple la décision de l'avocat. */
  children?: ReactNode;
}

function ClauseExcerpt({ clause }: { clause: Clause }): React.JSX.Element {
  return (
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
  );
}

export function ClauseCard({
  clause,
  variant = 'lawyer',
  lawyerDecision,
  children,
}: ClauseCardProps): React.JSX.Element {
  const [excerptOpen, setExcerptOpen] = useState(false);
  const strength = CLAUSE_STRENGTH_DISPLAY[clause.strength];

  if (variant === 'client') {
    const decision =
      lawyerDecision === undefined ? undefined : LAWYER_DECISION_DISPLAY[lawyerDecision];
    return (
      <Paper variant="outlined" component="article" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip size="small" color={strength.color} label={strength.label} />
            <Chip
              size="small"
              variant={decision === undefined ? 'outlined' : 'filled'}
              color={decision?.chipColor ?? 'default'}
              label={decision?.clientOutcome ?? 'Repéré par l’IA, à confirmer par un avocat'}
            />
          </Stack>
          <Typography variant="h6" component="h4">
            {clause.title}
          </Typography>
          <Typography>{clause.explanation}</Typography>
          <ReportField label="Ce que vous pourriez obtenir">{clause.potentialGain}</ReportField>
          <Box>
            <Button
              size="small"
              onClick={() => setExcerptOpen((open) => !open)}
              endIcon={excerptOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              aria-expanded={excerptOpen}
            >
              {excerptOpen ? 'Masquer le passage' : 'Voir le passage du contrat'}
            </Button>
            <Collapse in={excerptOpen} unmountOnExit>
              <Box sx={{ mt: 1 }}>
                <ClauseExcerpt clause={clause} />
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </Paper>
    );
  }

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
        <ClauseExcerpt clause={clause} />
        <ReportField label="Pourquoi c’est contestable">{clause.explanation}</ReportField>
        <ReportField label="Ce que vous pourriez obtenir">{clause.potentialGain}</ReportField>
        <ReportField label="Fondement">{clause.legalBasis}</ReportField>
        {children}
      </Stack>
    </Paper>
  );
}
