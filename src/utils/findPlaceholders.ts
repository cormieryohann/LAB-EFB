const PLACEHOLDER = /\[[^\]\n]+\]/g;

/** Champs laissés entre crochets par l'IA (« [Numéro du prêt] »), sans doublon, dans l'ordre. */
export function findPlaceholders(text: string): string[] {
  return [...new Set(text.match(PLACEHOLDER) ?? [])];
}
