import type { CaseDetails } from '../types/contractAnalysis';

type CaseDetailKey = Exclude<keyof CaseDetails, 'borrowers'>;

/** Libellés des informations du dossier, dans l'ordre d'affichage et de transmission à l'IA. */
export const CASE_DETAIL_LABELS: Record<CaseDetailKey, string> = {
  lender: 'Prêteur',
  lenderAddress: 'Adresse du prêteur',
  complaintsEmail: 'E-mail du service réclamations',
  mediator: 'Médiateur',
  mediatorEmail: 'E-mail du médiateur',
  loanType: 'Nature du crédit',
  loanReference: 'Référence du prêt',
  offerDate: 'Date de l’offre',
  loanAmount: 'Montant emprunté',
  duration: 'Durée',
  interestRate: 'Taux débiteur',
  annualPercentageRate: 'TAEG / TEG',
  monthlyPayment: 'Échéance',
  insurance: 'Assurance emprunteur',
};

export interface CaseDetailLine {
  label: string;
  value: string;
}

/** Les informations connues du dossier, emprunteurs en tête ; les champs vides sont omis. */
export function caseDetailLines(details: CaseDetails): CaseDetailLine[] {
  const borrowers = details.borrowers.map(({ name, address }) => ({
    label: 'Emprunteur',
    value: address === null ? name : `${name}, ${address}`,
  }));
  const fields = (Object.keys(CASE_DETAIL_LABELS) as CaseDetailKey[]).flatMap((key) => {
    const value = details[key]?.trim();
    return value === undefined || value.length === 0
      ? []
      : [{ label: CASE_DETAIL_LABELS[key], value }];
  });
  return [...borrowers, ...fields];
}
