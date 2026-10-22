/**
 * Suite d'au moins 20 caractères « lisibles » contenant un espace : c'est la forme du texte d'un
 * paragraphe, alors que les octets de structure du format binaire produisent du bruit court.
 */
const TEXT_RUN = /[\p{L}\p{N}\p{P}\p{S}\p{Zs}\t\r\n]{20,}/gu;

function readableRuns(decoded: string): string[] {
  return (decoded.match(TEXT_RUN) ?? [])
    .map((run) => run.replace(/\r/g, '\n').trim())
    .filter((run) => run.includes(' ') && /\p{L}{3,}/u.test(run));
}

/**
 * Extraction approximative d'un .doc (Word 97-2003, format binaire OLE). Le navigateur n'a pas de
 * lecteur pour ce format : on récupère les passages lisibles, encodés en UTF-16LE ou en cp1252
 * selon la façon dont Word a enregistré le fichier, et on garde le décodage le plus fourni.
 */
export function legacyDocToText(buffer: ArrayBuffer): string {
  const candidates = [new TextDecoder('utf-16le'), new TextDecoder('windows-1252')].map((decoder) =>
    readableRuns(decoder.decode(buffer)).join('\n'),
  );
  return candidates.reduce((best, candidate) =>
    candidate.length > best.length ? candidate : best,
  );
}
