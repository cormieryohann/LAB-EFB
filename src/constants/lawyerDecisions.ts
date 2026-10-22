import type { LawyerDecision } from '../stores/useLawyerReviewStore';

interface DecisionDisplay {
  /** Libellé du bouton de choix. */
  action: string;
  /** Libellé une fois la décision prise. */
  outcome: string;
  /** Couleur MUI : `standard` pour le bouton, `default` pour le badge. */
  buttonColor: 'success' | 'warning' | 'standard';
  chipColor: 'success' | 'warning' | 'default';
}

export const LAWYER_DECISION_DISPLAY: Record<LawyerDecision, DecisionDisplay> = {
  validee: { action: 'Valider', outcome: 'Validée', buttonColor: 'success', chipColor: 'success' },
  a_approfondir: {
    action: 'À approfondir',
    outcome: 'À approfondir',
    buttonColor: 'warning',
    chipColor: 'warning',
  },
  ecartee: { action: 'Écarter', outcome: 'Écartée', buttonColor: 'standard', chipColor: 'default' },
};

export const LAWYER_DECISIONS = Object.keys(LAWYER_DECISION_DISPLAY) as LawyerDecision[];
