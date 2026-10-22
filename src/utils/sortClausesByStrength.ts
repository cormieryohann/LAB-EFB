import { CLAUSE_STRENGTH_DISPLAY } from '../constants/clauseLabels';
import type { Clause } from '../types/contractAnalysis';

/** Les arguments les plus solides en premier ; l'ordre du document est conservé à solidité égale. */
export function sortClausesByStrength(clauses: Clause[]): Clause[] {
  return [...clauses].sort(
    (a, b) => CLAUSE_STRENGTH_DISPLAY[a.strength].rank - CLAUSE_STRENGTH_DISPLAY[b.strength].rank,
  );
}
