import type { DocumentFormat } from '../constants/documentFormats';

/**
 * Contenu d'un contrat prêt à être envoyé à l'IA : le PDF est lu nativement par Claude (bloc
 * `document` base64), les autres formats sont convertis en texte dans le navigateur.
 */
export type ContractContent =
  { kind: 'pdf'; base64: string } | { kind: 'text'; text: string; approximate: boolean };

export type UploadStatus = 'processing' | 'ready' | 'error';

export interface UploadedDocument {
  id: string;
  fileName: string;
  sizeBytes: number;
  format: DocumentFormat;
  status: UploadStatus;
  content?: ContractContent;
  errorMessage?: string;
}
