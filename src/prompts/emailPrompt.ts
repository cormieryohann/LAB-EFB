import type { AmicableEmailInput, EmailRecipient, RetainedClause } from '../types/amicableEmail';
import { caseDetailLines } from '../constants/caseDetailsLabels';
import { CLAUSE_CATEGORY_LABELS } from '../constants/clauseLabels';
import type { CaseDetails } from '../types/contractAnalysis';
import { formatCompletion } from './completionPrompt';
import emailGuidelines from './mail-amiable.md?raw';
import bankClaimTemplate from './modeles/3-amiable/reclamation-banque.md?raw';
import mediatorReferralTemplate from './modeles/3-amiable/saisine-mediateur.md?raw';

/** Modèle de lettre de l'étape amiable, propre à chaque destinataire. */
const RECIPIENT_TEMPLATES: Record<EmailRecipient, string> = {
  banque: bankClaimTemplate,
  mediateur: mediatorReferralTemplate,
};

/**
 * Consigne système de la rédaction du mail amiable. Le ton vit dans `mail-amiable.md`, la
 * structure dans le modèle du destinataire (`modeles/3-amiable/`) : tous deux modifiables sans
 * toucher au code.
 */
export function emailSystemPrompt(recipient: EmailRecipient): string {
  return `Tu es l'assistant de rédaction de VIGICONTRAT, un cabinet d'avocats qui défend les emprunteurs contre les clauses litigieuses de leurs contrats de crédit.

Ta mission : rédiger, en français, le mail de la démarche amiable que l'avocat enverra, à partir de son dossier validé. Suis les consignes générales, puis le modèle de lettre du destinataire.

<consignes>
${emailGuidelines}
</consignes>

<modele>
${RECIPIENT_TEMPLATES[recipient]}
</modele>`;
}

const RECIPIENT_LABELS: Record<EmailRecipient, string> = {
  banque: 'le service réclamations de la banque',
  mediateur: 'le médiateur bancaire',
};

/** Le traitement d'une clause « à approfondir » est précisé par les consignes de chaque document. */
const DECISION_LABELS = {
  validee: 'validée par l’avocat',
  a_approfondir: 'à approfondir',
} as const;

/** Informations du dossier extraites des documents, communes au mail et au projet d'assignation. */
export function formatCaseDetails(details: CaseDetails): string {
  const lines = caseDetailLines(details);
  const body =
    lines.length === 0
      ? 'Aucune information extraite des documents.'
      : lines.map(({ label, value }) => `${label} : ${value}`).join('\n');
  return `<informations_du_dossier>\n${body}\n</informations_du_dossier>`;
}

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
  caseDetails,
  retainedClauses,
  completion,
}: AmicableEmailInput): string {
  const instruction = `Rédige le mail adressé à ${RECIPIENT_LABELS[recipient]}.

Avocat signataire : ${lawyerName.trim()}

${formatCaseDetails(caseDetails)}

<synthese_du_dossier>
${summary}
</synthese_du_dossier>

<clauses_retenues>
${formatRetainedClauses(retainedClauses)}
</clauses_retenues>
${conclusion.trim().length > 0 ? `\n<conclusion_de_l_avocat>\n${conclusion.trim()}\n</conclusion_de_l_avocat>\n` : ''}`;
  return completion === undefined ? instruction : `${instruction}\n${formatCompletion(completion)}`;
}
