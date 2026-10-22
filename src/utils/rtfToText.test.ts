import { describe, expect, it } from 'vitest';
import { rtfToText } from './rtfToText';

/** Mot de contrôle RTF `\uN` suivi de son caractère de repli `?`. */
function rtfUnicode(codePoint: number): string {
  return '\\' + 'u' + codePoint + '?';
}

describe('rtfToText', () => {
  it('garde le texte et convertit les paragraphes en retours à la ligne', () => {
    const rtf = String.raw`{\rtf1\ansi{\fonttbl{\f0 Arial;}}\f0 Article 1\par Le pr\'eat est remboursable.\par}`;

    expect(rtfToText(rtf)).toBe('Article 1\nLe prêt est remboursable.');
  });

  it('ignore les destinations facultatives et décode les caractères unicode', () => {
    const rtf =
      String.raw`{\rtf1{\*\generator Word;}{\info{\title Secret}}Taux ` +
      rtfUnicode(8364) +
      String.raw` 3,5 %\par}`;

    expect(rtfToText(rtf)).toBe('Taux € 3,5 %');
  });

  it('conserve les caractères échappés', () => {
    expect(rtfToText(String.raw`{\rtf1 a\{b\}c\\d}`)).toBe('a{b}c\\d');
  });
});
