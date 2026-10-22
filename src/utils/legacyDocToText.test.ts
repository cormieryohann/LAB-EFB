import { describe, expect, it } from 'vitest';
import { legacyDocToText } from './legacyDocToText';

function concat(...parts: Uint8Array[]): ArrayBuffer {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result.buffer;
}

function utf16le(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length * 2);
  [...text].forEach((char, index) => {
    bytes[index * 2] = char.charCodeAt(0);
    bytes[index * 2 + 1] = char.charCodeAt(0) >> 8;
  });
  return bytes;
}

const binaryNoise = new Uint8Array([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 3, 0, 0xfe, 0xff,
]);

describe('legacyDocToText', () => {
  it('extrait le texte stocké en UTF-16LE au milieu des octets binaires', () => {
    const buffer = concat(
      binaryNoise,
      utf16le('La déchéance du terme sera prononcée après quinze jours.'),
      binaryNoise,
    );

    expect(legacyDocToText(buffer)).toContain(
      'La déchéance du terme sera prononcée après quinze jours.',
    );
  });

  it('extrait le texte stocké en cp1252', () => {
    // Caractères identiques en cp1252 et en latin1 : Node décode « windows-1252 » comme du latin1.
    const text = "Le taux effectif global prévu à l'article 3 est de 4,2 %.";
    const cp1252 = Uint8Array.from(text, (char) => char.charCodeAt(0));

    expect(legacyDocToText(concat(binaryNoise, cp1252, binaryNoise))).toContain(text);
  });
});
