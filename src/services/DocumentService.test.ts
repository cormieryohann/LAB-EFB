import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { DocumentReadError, readContractFile } from './DocumentService';

function textFile(name: string, content: string): File {
  return new File([content], name);
}

describe('readContractFile', () => {
  it('lit un fichier texte', async () => {
    await expect(
      readContractFile(textFile('contrat.txt', '  Article 1 : objet du prêt  ')),
    ).resolves.toEqual({
      kind: 'text',
      text: 'Article 1 : objet du prêt',
      approximate: false,
    });
  });

  it('retire les balises et scripts d’un fichier HTML', async () => {
    const html =
      '<html><body><script>alert(1)</script><h1>Offre de prêt</h1><p>Taux : 3 %</p></body></html>';

    const content = await readContractFile(textFile('offre.html', html));

    expect(content).toMatchObject({ kind: 'text', text: 'Offre de prêt\nTaux : 3 %' });
  });

  it('lit un fichier RTF', async () => {
    const content = await readContractFile(
      textFile('cgv.rtf', String.raw`{\rtf1 Clause 4\par Frais}`),
    );

    expect(content).toMatchObject({ kind: 'text', text: 'Clause 4\nFrais' });
  });

  it('lit les paragraphes d’un fichier OpenDocument', async () => {
    const zip = new JSZip();
    zip.file(
      'content.xml',
      `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
        xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
        <office:body><office:text>
          <text:h>Conditions générales</text:h>
          <text:p>Article<text:s/>1<text:tab/>Objet</text:p>
        </office:text></office:body>
      </office:document-content>`,
    );
    const file = new File([await zip.generateAsync({ type: 'arraybuffer' })], 'contrat.odt');

    const content = await readContractFile(file);

    expect(content).toMatchObject({ kind: 'text', text: 'Conditions générales\nArticle 1\tObjet' });
  });

  it('reconnaît un .doc qui est en réalité un RTF', async () => {
    const content = await readContractFile(
      textFile('ancien.doc', String.raw`{\rtf1 Avenant n\'b0 2}`),
    );

    expect(content).toEqual({ kind: 'text', text: 'Avenant n° 2', approximate: false });
  });

  it('encode un PDF en base64 pour l’IA', async () => {
    const content = await readContractFile(textFile('offre.pdf', '%PDF-1.7'));

    expect(content).toEqual({ kind: 'pdf', base64: btoa('%PDF-1.7') });
  });

  it('refuse un fichier sans texte', async () => {
    await expect(readContractFile(textFile('vide.txt', '   '))).rejects.toThrow(DocumentReadError);
  });

  it('refuse un format non pris en charge', async () => {
    await expect(readContractFile(textFile('photo.png', 'x'))).rejects.toThrow(
      'Format de fichier non pris en charge.',
    );
  });

  it('signale un fichier corrompu', async () => {
    await expect(readContractFile(textFile('casse.odt', 'pas un zip'))).rejects.toThrow(
      /Impossible de lire ce fichier/,
    );
  });
});
