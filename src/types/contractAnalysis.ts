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

/** Une information du dossier, recopiée des documents ; `null` quand ils ne la donnent pas. */
function caseField(description: string) {
  return z
    .string()
    .nullable()
    .describe(
      `${description} Recopié tel qu’il figure dans les documents ; null s’il n’y figure pas.`,
    );
}

/**
 * Informations du dossier reprises dans le mail amiable et le projet d'assignation, pour que
 * l'avocat ait le moins possible à compléter. Lues par l'avocat seulement.
 */
export const CaseDetailsSchema = z.object({
  borrowers: z
    .array(
      z.object({
        name: z.string().describe('Nom complet de l’emprunteur ou du co-emprunteur.'),
        address: caseField('Adresse postale de cette personne.'),
      }),
    )
    .describe(
      'Emprunteurs, co-emprunteurs et cautions nommés dans les documents. Liste vide si aucun.',
    ),
  lender: caseField('Nom de la banque ou de l’organisme prêteur.'),
  lenderAddress: caseField('Adresse du siège ou de l’agence du prêteur.'),
  complaintsEmail: caseField(
    'Adresse électronique du service réclamations du prêteur (une adresse e-mail, rien d’autre).',
  ),
  mediator: caseField('Nom et coordonnées du médiateur indiqué au contrat.'),
  mediatorEmail: caseField('Adresse électronique du médiateur (une adresse e-mail, rien d’autre).'),
  loanType: caseField(
    'Nature du crédit (crédit immobilier, prêt personnel, crédit renouvelable…).',
  ),
  loanReference: caseField('Numéro ou référence du prêt ou de l’offre.'),
  offerDate: caseField('Date de l’offre de prêt ou du contrat.'),
  loanAmount: caseField('Montant emprunté, avec la devise.'),
  duration: caseField('Durée du prêt.'),
  interestRate: caseField('Taux débiteur (taux nominal).'),
  annualPercentageRate: caseField('TAEG ou TEG annoncé.'),
  monthlyPayment: caseField('Montant de l’échéance.'),
  insurance: caseField('Assureur emprunteur et numéro du contrat d’assurance.'),
});

export type CaseDetails = z.infer<typeof CaseDetailsSchema>;

/**
 * Format imposé à la réponse de Claude (structured outputs). Les descriptions font partie du
 * schéma JSON envoyé : elles guident la rédaction de chaque champ.
 */
export const ContractAnalysisSchema = z.object({
  caseDetails: CaseDetailsSchema,
  summary: z
    .string()
    .describe(
      'Synthèse en 2 ou 3 phrases courtes, en mots de tous les jours : de quel contrat il s’agit et ce qu’il faut retenir.',
    ),
  clauses: z
    .array(
      z.object({
        title: z
          .string()
          .describe(
            'Intitulé court, en mots de tous les jours (ex. « Frais de retard trop élevés »).',
          ),
        category: z.enum(CLAUSE_CATEGORIES),
        documentName: z.string().describe('Nom du fichier où figure la clause.'),
        excerpt: z
          .string()
          .describe('Citation exacte de la clause, telle qu’elle apparaît dans le document.'),
        explanation: z
          .string()
          .describe('Pourquoi la clause pose problème, en 1 ou 2 phrases, sans terme juridique.'),
        legalBasis: z
          .string()
          .describe(
            'Fondement, destiné à l’avocat : article de loi ou décision de justice issus du référentiel.',
          ),
        potentialGain: z
          .string()
          .describe(
            'Ce que l’emprunteur pourrait obtenir, en 1 phrase, chiffré quand le contrat le permet.',
          ),
        strength: z
          .enum(CLAUSE_STRENGTHS)
          .describe('Solidité de l’argument au vu du texte de la clause.'),
      }),
    )
    .describe('Clauses contestables repérées. Liste vide si aucune.'),
  risks: z.string().describe('Que risque l’emprunteur s’il ne fait rien ? 1 ou 2 phrases simples.'),
  timeline: z
    .string()
    .describe(
      'En combien de temps ? 1 ou 2 phrases : jusqu’à quand il peut agir (prescription, dite simplement) et durée probable d’une démarche.',
    ),
  missingInformation: z
    .array(z.string())
    .describe('Documents manquants pour confirmer l’analyse, nommés simplement.'),
});

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;

export type Clause = ContractAnalysis['clauses'][number];
