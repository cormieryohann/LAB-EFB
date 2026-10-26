import type { LitigationInput } from '../types/litigation';
import { formatCaseDetails, formatRetainedClauses } from './emailPrompt';
import briefGuidelines from './projet-assignation.md?raw';

/**
 * Consigne système du projet d'acte contentieux. La structure de l'acte vit dans
 * `projet-assignation.md`, modifiable sans toucher au code.
 */
export const LITIGATION_SYSTEM_PROMPT = `Tu es l'assistant de rédaction de VIGICONTRAT, un cabinet d'avocats qui défend les emprunteurs contre les clauses litigieuses de leurs contrats de crédit.

Ta mission : rédiger, en français, le projet d'assignation de la procédure contentieuse, à partir du dossier validé par l'avocat. Suis les consignes ci-dessous.

<consignes>
${briefGuidelines}
</consignes>`;

export function litigationInstruction({
  lawyerName,
  conclusion,
  summary,
  caseDetails,
  retainedClauses,
  exhibits,
  amicableEmail,
  amicableOutcome,
}: LitigationInput): string {
  const sections = [
    `Rédige le projet d'assignation.\n\nAvocat constitué : ${lawyerName.trim()}`,
    formatCaseDetails(caseDetails),
    `<synthese_du_dossier>\n${summary}\n</synthese_du_dossier>`,
    `<clauses_retenues>\n${formatRetainedClauses(retainedClauses)}\n</clauses_retenues>`,
    `<bordereau_de_pieces>\n${exhibits.map((exhibit, index) => `Pièce n° ${index + 1} : ${exhibit}`).join('\n')}\n</bordereau_de_pieces>`,
  ];
  if (conclusion.trim().length > 0) {
    sections.push(`<conclusion_de_l_avocat>\n${conclusion.trim()}\n</conclusion_de_l_avocat>`);
  }
  if (amicableEmail !== undefined) {
    sections.push(
      `<demarche_amiable>\nObjet : ${amicableEmail.subject}\n\n${amicableEmail.body}\n</demarche_amiable>`,
    );
  }
  sections.push(
    amicableOutcome.trim().length > 0
      ? `<resultat_de_l_amiable>\n${amicableOutcome.trim()}\n</resultat_de_l_amiable>`
      : '<resultat_de_l_amiable>Non renseigné : laisser le résultat de la démarche amiable entre crochets.</resultat_de_l_amiable>',
  );
  return sections.join('\n\n');
}
