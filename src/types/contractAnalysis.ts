import { z } from 'zod/v4';

/** Mêmes identifiants que les sections de `src/prompts/clauses-abusives.md`. */
export const CLAUSE_CATEGORIES = [
  'teg_taeg',
  'frais_penalites',
  'decheance_terme',
  'responsabilite_banque',
  'modification_unilaterale',
  'assurance_emprunteur',
  'autre',
] as const;

export type ClauseCategory = (typeof CLAUSE_CATEGORIES)[number];

export const CLAUSE_STRENGTHS = ['forte', 'moyenne', 'faible'] as const;

export type ClauseStrength = (typeof CLAUSE_STRENGTHS)[number];

/**
 * Format imposé à la réponse de Claude (structured outputs). Les descriptions font partie du
 * schéma JSON envoyé : elles guident la rédaction de chaque champ.
 */
export const ContractAnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      'Synthèse en 3 à 5 phrases, en langage simple : nature du ou des contrats et principaux constats.',
    ),
  clauses: z
    .array(
      z.object({
        title: z
          .string()
          .describe('Intitulé court de la clause, compréhensible par un non-juriste.'),
        category: z.enum(CLAUSE_CATEGORIES),
        documentName: z.string().describe('Nom du fichier où figure la clause.'),
        excerpt: z
          .string()
          .describe('Citation exacte de la clause, telle qu’elle apparaît dans le document.'),
        explanation: z
          .string()
          .describe('Pourquoi la clause est contestable, expliqué simplement.'),
        legalBasis: z
          .string()
          .describe('Fondement : article de loi ou décision de justice issus du référentiel.'),
        potentialGain: z
          .string()
          .describe('Ce que l’emprunteur pourrait obtenir, chiffré quand le contrat le permet.'),
        strength: z
          .enum(CLAUSE_STRENGTHS)
          .describe('Solidité de l’argument au vu du texte de la clause.'),
      }),
    )
    .describe('Clauses contestables repérées. Liste vide si aucune.'),
  risks: z.string().describe('Que risque l’emprunteur s’il ne fait rien ? Langage simple.'),
  timeline: z
    .string()
    .describe('En combien de temps ? Délais de prescription et durée probable d’une démarche.'),
  missingInformation: z
    .array(z.string())
    .describe('Informations ou documents manquants pour confirmer l’analyse.'),
});

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;

export type Clause = ContractAnalysis['clauses'][number];
