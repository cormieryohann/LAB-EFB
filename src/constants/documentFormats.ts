export type DocumentFormat = 'pdf' | 'docx' | 'doc' | 'odt' | 'rtf' | 'txt' | 'md' | 'html';

interface DocumentFormatDefinition {
  label: string;
  extensions: string[];
  mimeTypes: string[];
}

export const DOCUMENT_FORMATS: Record<DocumentFormat, DocumentFormatDefinition> = {
  pdf: { label: 'PDF', extensions: ['.pdf'], mimeTypes: ['application/pdf'] },
  docx: {
    label: 'Word',
    extensions: ['.docx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  doc: { label: 'Word 97-2003', extensions: ['.doc'], mimeTypes: ['application/msword'] },
  odt: {
    label: 'OpenDocument',
    extensions: ['.odt'],
    mimeTypes: ['application/vnd.oasis.opendocument.text'],
  },
  rtf: { label: 'RTF', extensions: ['.rtf'], mimeTypes: ['application/rtf', 'text/rtf'] },
  txt: { label: 'Texte', extensions: ['.txt'], mimeTypes: ['text/plain'] },
  md: { label: 'Markdown', extensions: ['.md'], mimeTypes: ['text/markdown'] },
  html: { label: 'HTML', extensions: ['.html', '.htm'], mimeTypes: ['text/html'] },
};

/** L'API Claude limite une requête à 32 Mo, base64 compris (+33 %) : 20 Mo par fichier laisse de la marge. */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/** Valeur de l'option `accept` de react-dropzone : chaque MIME associé à ses extensions. */
export const DROPZONE_ACCEPT: Record<string, string[]> = Object.fromEntries(
  Object.values(DOCUMENT_FORMATS).flatMap(({ extensions, mimeTypes }) =>
    mimeTypes.map((mimeType) => [mimeType, extensions]),
  ),
);

export const ACCEPTED_EXTENSIONS: string[] = Object.values(DOCUMENT_FORMATS).flatMap(
  ({ extensions }) => extensions,
);

/** L'extension fait foi : le MIME fourni par le navigateur est souvent vide (.md) ou générique. */
export function detectFormat(fileName: string): DocumentFormat | undefined {
  const lowerName = fileName.toLowerCase();
  const entry = Object.entries(DOCUMENT_FORMATS).find(([, { extensions }]) =>
    extensions.some((extension) => lowerName.endsWith(extension)),
  );
  return entry?.[0] as DocumentFormat | undefined;
}
