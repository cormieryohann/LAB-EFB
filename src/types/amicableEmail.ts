import { z } from 'zod/v4';
import type { LawyerDecision } from '../stores/useLawyerReviewStore';
import type { CaseDetails, Clause } from './contractAnalysis';

export type EmailRecipient = 'banque' | 'mediateur';

export interface RetainedClause {
  clause: Clause;
  decision: Exclude<LawyerDecision, 'ecartee'>;
  note: string;
}

export interface AmicableEmailInput {
  recipient: EmailRecipient;
  lawyerName: string;
  conclusion: string;
  summary: string;
  caseDetails: CaseDetails;
  retainedClauses: RetainedClause[];
}

export const AmicableEmailSchema = z.object({
  subject: z.string().describe('Objet du mail, précis et sans formule d’alerte.'),
  body: z
    .string()
    .describe(
      'Corps du mail en texte brut, paragraphes séparés par une ligne vide, signé par l’avocat.',
    ),
});

export type AmicableEmail = z.infer<typeof AmicableEmailSchema>;
