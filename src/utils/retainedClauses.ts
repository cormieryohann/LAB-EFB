import type { ClauseReview } from '../stores/useLawyerReviewStore';
import type { RetainedClause } from '../types/amicableEmail';
import type { Clause } from '../types/contractAnalysis';

/**
 * Clauses validées ou à approfondir, avec l'avis de l'avocat. `clauses` doit être dans l'ordre du
 * rapport trié : c'est la position qui relie une clause à son avis.
 */
export function retainedClauses(
  clauses: Clause[],
  reviews: Record<number, ClauseReview>,
): RetainedClause[] {
  return clauses.flatMap((clause, index) => {
    const review = reviews[index];
    if (review?.decision === undefined || review.decision === 'ecartee') return [];
    return [{ clause, decision: review.decision, note: review.note }];
  });
}
