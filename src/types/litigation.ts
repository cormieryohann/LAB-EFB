import { z } from 'zod/v4';
import type { AmicableEmail, RetainedClause } from './amicableEmail';
import type { CaseDetails } from './contractAnalysis';

export interface LitigationInput {
  lawyerName: string;
  conclusion: string;
  summary: string;
  caseDetails: CaseDetails;
  retainedClauses: RetainedClause[];
  /** Pièces numérotées dans l'ordre du bordereau : l'IA les cite par leur numéro. */
  exhibits: string[];
  amicableEmail?: AmicableEmail;
  /** Réponse de la banque ou du médiateur à la démarche amiable, telle que saisie par l'avocat. */
  amicableOutcome: string;
}

export const LitigationBriefSchema = z.object({
  title: z.string().describe('Intitulé de l’acte, par exemple « Projet d’assignation ».'),
  body: z
    .string()
    .describe('Texte complet de l’acte en texte brut, sections séparées par une ligne vide.'),
});

export type LitigationBrief = z.infer<typeof LitigationBriefSchema>;
