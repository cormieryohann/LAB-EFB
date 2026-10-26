import type { CaseDetails } from '../types/contractAnalysis';

/** Dossier sans aucune information extraite : chaque test complète ce dont il a besoin. */
export const EMPTY_CASE_DETAILS: CaseDetails = {
  borrowers: [],
  lender: null,
  lenderAddress: null,
  complaintsEmail: null,
  mediator: null,
  mediatorEmail: null,
  loanType: null,
  loanReference: null,
  offerDate: null,
  loanAmount: null,
  duration: null,
  interestRate: null,
  annualPercentageRate: null,
  monthlyPayment: null,
  insurance: null,
};
