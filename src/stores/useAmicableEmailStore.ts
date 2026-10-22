import { create } from 'zustand';
import type { AmicableEmail, EmailRecipient } from '../types/amicableEmail';

interface AmicableEmailState {
  recipient: EmailRecipient;
  recipientAddress: string;
  /** Brouillon modifiable ; absent tant que l'IA ne l'a pas rédigé. */
  draft?: AmicableEmail;
  setRecipient: (recipient: EmailRecipient) => void;
  setRecipientAddress: (recipientAddress: string) => void;
  setDraft: (draft: AmicableEmail) => void;
  updateDraft: (changes: Partial<AmicableEmail>) => void;
  resetEmail: () => void;
}

/** Non persisté : le mail contient les données du contrat, comme le reste du dossier. */
export const useAmicableEmailStore = create<AmicableEmailState>()((set) => ({
  recipient: 'banque',
  recipientAddress: '',
  setRecipient: (recipient) => set({ recipient }),
  setRecipientAddress: (recipientAddress) => set({ recipientAddress }),
  setDraft: (draft) => set({ draft }),
  updateDraft: (changes) =>
    set((state) => (state.draft === undefined ? {} : { draft: { ...state.draft, ...changes } })),
  resetEmail: () => set({ recipient: 'banque', recipientAddress: '', draft: undefined }),
}));
