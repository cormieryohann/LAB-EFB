import { create } from 'zustand';
import type { UploadedDocument } from '../types/contractDocument';

interface DocumentState {
  documents: UploadedDocument[];
  addDocument: (document: UploadedDocument) => void;
  updateDocument: (id: string, changes: Partial<UploadedDocument>) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;
}

/** Volontairement non persisté : un contrat ne doit pas rester dans le navigateur après la session. */
export const useDocumentStore = create<DocumentState>()((set) => ({
  documents: [],
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  updateDocument: (id, changes) =>
    set((state) => ({
      documents: state.documents.map((document) =>
        document.id === id ? { ...document, ...changes } : document,
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((document) => document.id !== id) })),
  clearDocuments: () => set({ documents: [] }),
}));
