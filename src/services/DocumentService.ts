import { detectFormat } from '../constants/documentFormats';
import type { DocumentFormat } from '../constants/documentFormats';
import type { ContractContent } from '../types/contractDocument';
import { arrayBufferToBase64 } from '../utils/arrayBufferToBase64';
import { legacyDocToText } from '../utils/legacyDocToText';
import { rtfToText } from '../utils/rtfToText';

/** Erreur dont le message peut être affiché tel quel à l'utilisateur. */
export class DocumentReadError extends Error {
  override name = 'DocumentReadError';
}

function htmlToText(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style').forEach((element) => element.remove());
  document.querySelectorAll('br').forEach((element) => element.replaceWith('\n'));
  document
    .querySelectorAll('p, div, li, tr, h1, h2, h3, h4, h5, h6')
    .forEach((element) => element.append('\n'));
  return (document.body.textContent ?? '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n');
}

/** Paragraphes (`text:p`) et titres (`text:h`) du `content.xml` d'un fichier OpenDocument. */
async function odtToText(buffer: ArrayBuffer): Promise<string> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const contentXml = await zip.file('content.xml')?.async('string');
  if (contentXml === undefined) throw new DocumentReadError('Fichier OpenDocument invalide.');

  const xml = new DOMParser().parseFromString(contentXml, 'application/xml');
  const paragraphs: string[] = [];

  const inlineText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof Element)) return '';
    if (node.localName === 's') return ' '.repeat(Number(node.getAttribute('text:c') ?? 1));
    if (node.localName === 'tab') return '\t';
    if (node.localName === 'line-break') return '\n';
    return Array.from(node.childNodes, inlineText).join('');
  };

  const walk = (element: Element): void => {
    if (element.localName === 'p' || element.localName === 'h') {
      paragraphs.push(inlineText(element));
      return;
    }
    Array.from(element.children).forEach(walk);
  };
  walk(xml.documentElement);

  return paragraphs.join('\n');
}

/** Un .doc est parfois un RTF ou un HTML renommé (exports de logiciels bancaires). */
function readLegacyDoc(buffer: ArrayBuffer): ContractContent {
  const head = new TextDecoder('windows-1252').decode(buffer.slice(0, 512)).trimStart();
  if (head.startsWith('{\\rtf')) {
    return {
      kind: 'text',
      text: rtfToText(new TextDecoder('windows-1252').decode(buffer)),
      approximate: false,
    };
  }
  if (head.startsWith('<')) {
    return { kind: 'text', text: htmlToText(new TextDecoder().decode(buffer)), approximate: false };
  }
  return { kind: 'text', text: legacyDocToText(buffer), approximate: true };
}

async function readByFormat(file: File, format: DocumentFormat): Promise<ContractContent> {
  switch (format) {
    case 'pdf':
      return { kind: 'pdf', base64: arrayBufferToBase64(await file.arrayBuffer()) };
    case 'docx': {
      const { default: mammoth } = await import('mammoth');
      const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return { kind: 'text', text: value, approximate: false };
    }
    case 'doc':
      return readLegacyDoc(await file.arrayBuffer());
    case 'odt':
      return { kind: 'text', text: await odtToText(await file.arrayBuffer()), approximate: false };
    case 'rtf':
      return { kind: 'text', text: rtfToText(await file.text()), approximate: false };
    case 'html':
      return { kind: 'text', text: htmlToText(await file.text()), approximate: false };
    case 'txt':
    case 'md':
      return { kind: 'text', text: await file.text(), approximate: false };
  }
}

/** Lit un fichier déposé et le convertit en contenu exploitable par l'IA, sans quitter le navigateur. */
export async function readContractFile(file: File): Promise<ContractContent> {
  const format = detectFormat(file.name);
  if (format === undefined) throw new DocumentReadError('Format de fichier non pris en charge.');

  let content: ContractContent;
  try {
    content = await readByFormat(file, format);
  } catch (error) {
    if (error instanceof DocumentReadError) throw error;
    throw new DocumentReadError(
      'Impossible de lire ce fichier : il est peut-être corrompu ou protégé.',
      {
        cause: error,
      },
    );
  }

  if (content.kind === 'text') {
    const text = content.text.trim();
    if (text.length === 0) {
      throw new DocumentReadError(
        'Aucun texte trouvé dans ce fichier. S’il s’agit d’un scan, déposez-le plutôt en PDF.',
      );
    }
    return { ...content, text };
  }
  return content;
}
