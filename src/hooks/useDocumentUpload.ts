import { useCallback } from 'react';
import { detectFormat } from '../constants/documentFormats';
import { DocumentReadError, readContractFile } from '../services/DocumentService';
import { useDocumentStore } from '../stores/useDocumentStore';

/** Ajoute les fichiers déposés au store puis les lit en parallèle, chacun avec son propre statut. */
export function useDocumentUpload(): (files: File[]) => void {
  const addDocument = useDocumentStore((state) => state.addDocument);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  return useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const format = detectFormat(file.name);
        if (format === undefined) return;

        const id = crypto.randomUUID();
        addDocument({
          id,
          fileName: file.name,
          sizeBytes: file.size,
          format,
          status: 'processing',
        });

        readContractFile(file)
          .then((content) => updateDocument(id, { status: 'ready', content }))
          .catch((error: unknown) =>
            updateDocument(id, {
              status: 'error',
              errorMessage:
                error instanceof DocumentReadError
                  ? error.message
                  : 'Erreur inattendue à la lecture.',
            }),
          );
      });
    },
    [addDocument, updateDocument],
  );
}
