import { create } from 'zustand';

export type LawyerDecision = 'validee' | 'a_approfondir' | 'ecartee';

/** Voie engagée par l'avocat après la validation : le client la suit depuis son espace. */
export type LegalPath = 'amicable' | 'litigation';

export interface ClauseReview {
  decision?: LawyerDecision;
  note: string;
}

interface LawyerReviewState {
  /** Avis de l'avocat par clause, indexé sur la position de la clause dans le rapport trié. */
  reviews: Record<number, ClauseReview>;
  lawyerName: string;
  conclusion: string;
  /** Date ISO de la transmission du dossier par le client ; absente tant qu'il n'est pas envoyé. */
  submittedAt?: string;
  /** Date ISO de la validation ; absente tant que l'avocat n'a pas confirmé. */
  validatedAt?: string;
  /** Absente tant que l'avocat n'a choisi ni l'amiable ni le contentieux. */
  path?: LegalPath;
  submitToLawyer: () => void;
  setDecision: (clauseIndex: number, decision: LawyerDecision) => void;
  setNote: (clauseIndex: number, note: string) => void;
  setLawyerName: (lawyerName: string) => void;
  setConclusion: (conclusion: string) => void;
  confirmValidation: () => void;
  reopenValidation: () => void;
  choosePath: (path: LegalPath) => void;
  resetReview: () => void;
}

const EMPTY_REVIEW: ClauseReview = { note: '' };

/** Non persisté, comme les documents : la revue porte sur un contrat qui ne reste pas en mémoire. */
export const useLawyerReviewStore = create<LawyerReviewState>()((set) => ({
  reviews: {},
  lawyerName: '',
  conclusion: '',
  submitToLawyer: () => set({ submittedAt: new Date().toISOString() }),
  setDecision: (clauseIndex, decision) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [clauseIndex]: { ...(state.reviews[clauseIndex] ?? EMPTY_REVIEW), decision },
      },
    })),
  setNote: (clauseIndex, note) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [clauseIndex]: { ...(state.reviews[clauseIndex] ?? EMPTY_REVIEW), note },
      },
    })),
  setLawyerName: (lawyerName) => set({ lawyerName }),
  setConclusion: (conclusion) => set({ conclusion }),
  confirmValidation: () => set({ validatedAt: new Date().toISOString() }),
  // Rouvrir la validation remet en cause la voie choisie sur sa base.
  reopenValidation: () => set({ validatedAt: undefined, path: undefined }),
  choosePath: (path) => set({ path }),
  resetReview: () =>
    set({
      reviews: {},
      lawyerName: '',
      conclusion: '',
      submittedAt: undefined,
      validatedAt: undefined,
      path: undefined,
    }),
}));
