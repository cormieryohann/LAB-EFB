import { create } from 'zustand';
import type { LitigationBrief } from '../types/litigation';

interface LitigationState {
  amicableOutcome: string;
  /** Projet d'acte modifiable ; absent tant que l'IA ne l'a pas rédigé. */
  draft?: LitigationBrief;
  setAmicableOutcome: (amicableOutcome: string) => void;
  setDraft: (draft: LitigationBrief) => void;
  updateDraft: (changes: Partial<LitigationBrief>) => void;
  resetLitigation: () => void;
}

/** Non persisté : le projet d'acte contient les données du contrat, comme le reste du dossier. */
export const useLitigationStore = create<LitigationState>()((set) => ({
  amicableOutcome: '',
  setAmicableOutcome: (amicableOutcome) => set({ amicableOutcome }),
  setDraft: (draft) => set({ draft }),
  updateDraft: (changes) =>
    set((state) => (state.draft === undefined ? {} : { draft: { ...state.draft, ...changes } })),
  resetLitigation: () => set({ amicableOutcome: '', draft: undefined }),
}));
