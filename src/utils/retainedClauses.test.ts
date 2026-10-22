import { describe, expect, it } from 'vitest';
import type { Clause } from '../types/contractAnalysis';
import { retainedClauses } from './retainedClauses';

function clause(title: string): Clause {
  return {
    title,
    category: 'autre',
    documentName: 'contrat.pdf',
    excerpt: '…',
    explanation: '…',
    legalBasis: '…',
    potentialGain: '…',
    strength: 'moyenne',
  };
}

describe('retainedClauses', () => {
  it('garde les clauses validées ou à approfondir, avec la note de l’avocat', () => {
    const clauses = [clause('A'), clause('B'), clause('C'), clause('D')];

    const result = retainedClauses(clauses, {
      0: { decision: 'validee', note: 'Solide' },
      1: { decision: 'ecartee', note: '' },
      2: { decision: 'a_approfondir', note: '' },
    });

    expect(result).toEqual([
      { clause: clauses[0], decision: 'validee', note: 'Solide' },
      { clause: clauses[2], decision: 'a_approfondir', note: '' },
    ]);
  });
});
