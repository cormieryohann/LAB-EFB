import type { ClauseCategory, ClauseStrength } from '../types/contractAnalysis';

export const CLAUSE_CATEGORY_LABELS: Record<ClauseCategory, string> = {
  teg_taeg: 'TEG / TAEG',
  frais_penalites: 'Frais et pénalités',
  decheance_terme: 'Déchéance du terme',
  responsabilite_banque: 'Responsabilité de la banque',
  modification_unilaterale: 'Modification unilatérale',
  assurance_emprunteur: 'Assurance emprunteur',
  autre: 'Autre clause',
};

interface StrengthDisplay {
  label: string;
  color: 'error' | 'warning' | 'default';
  /** Ordre d'affichage : les arguments les plus solides en premier. */
  rank: number;
}

export const CLAUSE_STRENGTH_DISPLAY: Record<ClauseStrength, StrengthDisplay> = {
  forte: { label: 'Argument solide', color: 'error', rank: 0 },
  moyenne: { label: 'Argument à étayer', color: 'warning', rank: 1 },
  faible: { label: 'Piste à vérifier', color: 'default', rank: 2 },
};
