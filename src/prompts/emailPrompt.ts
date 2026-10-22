import type { AmicableEmailInput, EmailRecipient, RetainedClause } from '../types/amicableEmail';
import { CLAUSE_CATEGORY_LABELS } from '../constants/clauseLabels';
import emailGuidelines from './mail-amiable.md?raw';

/**
 * Consigne système de la rédaction du mail amiable. Le ton et la structure du mail vivent dans
 * `mail-amiable.md`, modifiable sans toucher au code.
 */
export const EMAIL_SYSTEM_PROMPT = `Tu es l'assistant de rédaction de VIGICONTRAT, un cabinet d'avocats qui défend les emprunteurs contre les clauses abusives de leurs contrats de crédit.

Ta mission : rédiger, en français, le mail de la démarche amiable que l'avocat enverra, à partir de son dossier validé. Suis les consignes ci-dessous.

<consignes>
${emailGuidelines}
</consignes>`;

const RECIPIENT_LABELS: Record<EmailRecipient, string> = {
  banque: 'le service réclamations de la banque',
  mediateur: 'le médiateur bancaire',
};

/** Le traitement d'une clause « à approfondir » est précisé par les consignes de chaque document. */
const DECISION_LABELS = {
  validee: 'validée par l’avocat',
  a_approfondir: 'à approfondir',
} as const;

/** Bloc des clauses retenues, commun au mail amiable et au projet d'assignation. */
export function formatRetainedClauses(retainedClauses: RetainedClause[]): string {
  return retainedClauses
    .map(({ clause, decision, note }, index) =>
      [
        `<clause numero="${index + 1}">`,
        `Intitulé : ${clause.title}`,
        `Catégorie : ${CLAUSE_CATEGORY_LABELS[clause.category]}`,
        `Décision : ${DECISION_LABELS[decision]}`,
        `Document : ${clause.documentName}`,
        `Citation : « ${clause.excerpt} »`,
        `Motif : ${clause.explanation}`,
        `Fondement : ${clause.legalBasis}`,
        `Gain possible : ${clause.potentialGain}`,
        ...(note.trim().length > 0 ? [`Note de l'avocat : ${note.trim()}`] : []),
        '</clause>',
      ].join('\n'),
    )
    .join('\n');
}

export function emailInstruction({
  recipient,
  lawyerName,
  conclusion,
  summary,
  retainedClauses,
}: AmicableEmailInput): string {
  return `Rédige le mail adressé à ${RECIPIENT_LABELS[recipient]}.

Avocat signataire : ${lawyerName.trim()}

<synthese_du_dossier>
${summary}
</synthese_du_dossier>

<clauses_retenues>
${formatRetainedClauses(retainedClauses)}
</clauses_retenues>
${conclusion.trim().length > 0 ? `\n<conclusion_de_l_avocat>\n${conclusion.trim()}\n</conclusion_de_l_avocat>\n` : ''}`;
}
