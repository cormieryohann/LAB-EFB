import type { LawyerDecision } from '../stores/useLawyerReviewStore';

interface DecisionDisplay {
  /** Libellé du bouton de choix. */
  action: string;
  /** Libellé une fois la décision prise. */
  outcome: string;
  /** Libellé montré au client sur la clause, une fois la pré-analyse validée. */
  clientOutcome: string;
  /** Couleur MUI : `standard` pour le bouton, `default` pour le badge. */
  buttonColor: 'success' | 'warning' | 'standard';
  chipColor: 'success' | 'warning' | 'default';
}

export const LAWYER_DECISION_DISPLAY: Record<LawyerDecision, DecisionDisplay> = {
  validee: {
    action: 'Valider',
    outcome: 'Validée',
    clientOutcome: 'Confirmé par votre avocat',
    buttonColor: 'success',
    chipColor: 'success',
  },
  a_approfondir: {
    action: 'À approfondir',
    outcome: 'À approfondir',
    clientOutcome: 'Votre avocat creuse ce point',
    buttonColor: 'warning',
    chipColor: 'warning',
  },
  ecartee: {
    action: 'Écarter',
    outcome: 'Écartée',
    clientOutcome: 'Écarté par votre avocat',
    buttonColor: 'standard',
    chipColor: 'default',
  },
};

export const LAWYER_DECISIONS = Object.keys(LAWYER_DECISION_DISPLAY) as LawyerDecision[];
