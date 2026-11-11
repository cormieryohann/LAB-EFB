import type { DocumentCompletion } from '../types/documentCompletion';

/**
 * Bloc ajouté à la consigne quand l'avocat complète un document déjà rédigé : l'IA reprend le
 * texte courant au lieu de repartir de zéro, pour ne pas perdre les modifications de l'avocat.
 */
export function formatCompletion({ previousDraft, answers, notes }: DocumentCompletion): string {
  const sections = [
    'Ce document a déjà été rédigé, puis relu par l’avocat. Ne le rédige pas à nouveau : complète-le.',
    `<document_a_completer>\n${previousDraft}\n</document_a_completer>`,
  ];
  if (answers.length > 0) {
    sections.push(
      `<informations_completees>\n${answers
        .map(({ placeholder, value }) => `${placeholder} : ${value}`)
        .join('\n')}\n</informations_completees>`,
    );
  }
  if (notes.trim().length > 0) {
    sections.push(`<precisions_de_l_avocat>\n${notes.trim()}\n</precisions_de_l_avocat>`);
  }
  sections.push(`Règles du complément :
- Reprends le texte de <document_a_completer> tel quel, avec les modifications de l'avocat.
- Remplace chaque champ entre crochets listé dans <informations_completees> par la valeur donnée, en accordant la phrase si besoin (genre, nombre). Une valeur qui tranche un choix du modèle (« [À vérifier par l'avocat : …] », une branche conditionnelle) s'applique au paragraphe concerné.
- Intègre les précisions de l'avocat à l'endroit où elles ont leur place, dans le même style.
- Laisse entre crochets tout champ qui n'a pas reçu de valeur. Ne modifie rien d'autre et n'invente aucune information.`);
  return sections.join('\n\n');
}
