import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClaudeServiceError, analyzeContracts } from '../services/ClaudeService';
import type * as ClaudeServiceModule from '../services/ClaudeService';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { EMPTY_CASE_DETAILS } from '../test/caseDetails';
import { renderWithProviders } from '../test/renderWithProviders';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { UploadPage } from './UploadPage';

vi.mock('../services/ClaudeService', async (importOriginal) => ({
  ...(await importOriginal<typeof ClaudeServiceModule>()),
  analyzeContracts: vi.fn(),
}));

const CONTRACT_TEXT = 'La banque peut prononcer la déchéance du terme.';

const ANALYSIS: ContractAnalysis = {
  caseDetails: { ...EMPTY_CASE_DETAILS, loanReference: 'PR-2019-4471' },
  summary: 'Contrat de crédit immobilier.',
  clauses: [
    {
      title: 'Clause de variation du taux',
      category: 'modification_unilaterale',
      documentName: 'contrat.txt',
      excerpt: 'La banque peut modifier le taux.',
      explanation: 'La banque peut changer le taux seule.',
      legalBasis: 'Article R.212-1 du Code de la consommation',
      potentialGain: 'Maintien du taux initial.',
      strength: 'moyenne',
    },
    {
      title: 'Déchéance du terme sans préavis',
      category: 'decheance_terme',
      documentName: 'contrat.txt',
      excerpt: CONTRACT_TEXT,
      explanation: 'Aucun délai pour régulariser.',
      legalBasis: 'Cass. civ. 1re, 29 mai 2024',
      potentialGain: 'Annulation de la déchéance.',
      strength: 'forte',
    },
  ],
  risks: 'Remboursement immédiat exigé.',
  timeline: 'Prescription de 5 ans.',
  missingInformation: ['Tableau d’amortissement'],
};

async function uploadContract(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.upload(
    screen.getByLabelText('Sélectionner vos contrats'),
    new File([CONTRACT_TEXT], 'contrat.txt', { type: 'text/plain' }),
  );
  await screen.findByText('8 mots extraits');
}

async function analyzeContract(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await uploadContract(user);
  await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));
  await screen.findByRole('region', { name: 'Rapport de pré-analyse' });
}

async function submitToLawyer(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Transmettre à l’avocat' }));
}

describe('UploadPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useDocumentStore.setState({ documents: [] });
    useApiKeyStore.setState({ apiKey: null, remembered: false });
    useLawyerReviewStore.getState().resetReview();
    vi.mocked(analyzeContracts).mockReset();
  });

  it('lit un contrat sélectionné et affiche le texte extrait', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);

    const list = screen.getByRole('list', { name: /Documents déposés/ });
    expect(within(list).getByText('contrat.txt')).toBeInTheDocument();
    await user.click(within(list).getByRole('button', { name: 'Voir le texte' }));
    expect(within(list).getByText(CONTRACT_TEXT)).toBeVisible();
  });

  it('refuse un format qui ne peut pas être un contrat', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(<UploadPage />);

    await user.upload(
      screen.getByLabelText('Sélectionner vos contrats'),
      new File(['x'], 'photo.png', { type: 'image/png' }),
    );

    expect(await screen.findByText('photo.png : format non pris en charge.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /Documents déposés/ })).not.toBeInTheDocument();
  });

  it('retire un document de la liste', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Retirer contrat.txt' }));

    expect(screen.queryByText('contrat.txt')).not.toBeInTheDocument();
  });

  it('demande la clé Claude avant de lancer la pré-analyse', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);

    expect(
      screen.getByText('Ajoutez votre clé Claude pour lancer la pré-analyse.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lancer la pré-analyse' })).not.toBeInTheDocument();
  });

  it('envoie les documents à l’IA et affiche le rapport, arguments solides en premier', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));

    const report = await screen.findByRole('region', { name: 'Rapport de pré-analyse' });
    expect(analyzeContracts).toHaveBeenCalledWith('sk-ant-test', [
      {
        fileName: 'contrat.txt',
        content: { kind: 'text', text: CONTRACT_TEXT, approximate: false },
      },
    ]);
    expect(within(report).getByText('2 clauses contestables')).toBeInTheDocument();
    const titles = within(report)
      .getAllByRole('heading', { level: 4 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['Déchéance du terme sans préavis', 'Clause de variation du taux']);
    expect(within(report).getByText('Tableau d’amortissement')).toBeInTheDocument();
  });

  it('montre au client l’essentiel, sans le fondement juridique réservé à l’avocat', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await analyzeContract(user);

    const report = screen.getByRole('region', { name: 'Rapport de pré-analyse' });
    expect(within(report).getByText('Aucun délai pour régulariser.')).toBeInTheDocument();
    expect(within(report).queryByText('Cass. civ. 1re, 29 mai 2024')).not.toBeInTheDocument();
    expect(within(report).queryByText('Déchéance du terme')).not.toBeInTheDocument();
    expect(within(report).queryByText(/La banque peut prononcer/)).not.toBeInTheDocument();

    const [firstExcerptToggle] = within(report).getAllByRole('button', {
      name: 'Voir le passage du contrat',
    });
    await user.click(firstExcerptToggle);
    expect(within(report).getByText(/La banque peut prononcer/)).toBeInTheDocument();
  }, 15_000);

  it('affiche l’erreur renvoyée par l’IA', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockRejectedValue(new ClaudeServiceError('Clé refusée.'));
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));

    expect(await screen.findByText('Clé refusée.')).toBeInTheDocument();
  });

  it('signale que le rapport ne correspond plus aux documents déposés', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));
    await screen.findByRole('region', { name: 'Rapport de pré-analyse' });
    await user.upload(
      screen.getByLabelText('Sélectionner vos contrats'),
      new File(['Avenant au contrat de prêt immobilier'], 'avenant.txt', { type: 'text/plain' }),
    );

    expect(
      await screen.findByText(/Vos documents ont changé depuis cette analyse/),
    ).toBeInTheDocument();
  });

  it('l’avocat valide ou écarte chaque clause avant de confirmer', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await analyzeContract(user);
    await submitToLawyer(user);
    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));

    const review = screen.getByRole('region', { name: /Espace avocat/ });
    const caseDetails = within(review).getByRole('region', { name: /Informations du dossier/ });
    expect(within(caseDetails).getByText('PR-2019-4471')).toBeInTheDocument();
    const confirm = within(review).getByRole('button', { name: 'Confirmer la validation' });
    expect(confirm).toBeDisabled();

    // Clause 1 : la plus solide (déchéance du terme), clause 2 : variation du taux.
    const firstClause = within(review).getByRole('group', { name: 'Décision pour la clause 1' });
    await user.click(within(firstClause).getByRole('button', { name: 'Valider' }));
    const [firstNote] = within(review).getAllByLabelText('Note de l’avocat (facultatif)');
    await user.type(firstNote, 'Jurisprudence favorable');
    const secondClause = within(review).getByRole('group', { name: 'Décision pour la clause 2' });
    await user.click(within(secondClause).getByRole('button', { name: 'Écarter' }));
    expect(confirm).toBeDisabled();

    await user.type(within(review).getByLabelText(/Avocat en charge du dossier/), 'Me Martin');
    await user.click(confirm);

    expect(within(review).getByText(/Pré-analyse validée par Me Martin/)).toBeInTheDocument();
    expect(within(review).getByText('1 clause retenue · 1 écartée')).toBeInTheDocument();
    expect(within(review).getByText('Jurisprudence favorable')).toBeInTheDocument();
    expect(within(review).queryByText('Clause de variation du taux')).not.toBeInTheDocument();

    expect(
      within(review).getByRole('button', { name: 'Passer au contentieux' }),
    ).toBeInTheDocument();
    await user.click(within(review).getByRole('button', { name: 'Rédiger le mail amiable' }));
    expect(screen.getByRole('heading', { name: 'Démarche amiable : le mail' })).toBeInTheDocument();
  }, 30_000);

  it('l’espace avocat attend le dossier tant que le client n’a pas lancé la pré-analyse', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));

    const lawyerSpace = screen.getByRole('region', { name: 'Espace avocat' });
    expect(within(lawyerSpace).getByText(/Aucun dossier à valider/)).toBeInTheDocument();
    expect(screen.getByText('Procédure contentieuse')).toBeInTheDocument();
    expect(screen.queryByText('Dépôt et pré-analyse IA')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Sélectionner vos contrats')).not.toBeInTheDocument();
  });

  it('le client suit l’avancement de son dossier traité par l’avocat', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await analyzeContract(user);
    expect(screen.getByText('Défense de vos droits')).toBeInTheDocument();
    expect(screen.queryByText('Procédure contentieuse')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Suivi de votre dossier' }),
    ).not.toBeInTheDocument();
    await submitToLawyer(user);
    expect(screen.getByText(/Dossier transmis à l’avocat le/)).toBeInTheDocument();
    const tracker = screen.getByRole('region', { name: 'Suivi de votre dossier' });
    expect(within(tracker).getByText(/Un avocat relit votre pré-analyse/)).toBeInTheDocument();
    const report = screen.getByRole('region', { name: 'Rapport de pré-analyse' });
    expect(within(report).getByText('L’IA peut se tromper')).toBeInTheDocument();
    expect(within(report).getAllByText('Repéré par l’IA, à confirmer par un avocat')).toHaveLength(
      2,
    );

    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));
    const review = screen.getByRole('region', { name: /Espace avocat/ });
    const firstClause = within(review).getByRole('group', { name: 'Décision pour la clause 1' });
    await user.click(within(firstClause).getByRole('button', { name: 'Valider' }));
    const secondClause = within(review).getByRole('group', { name: 'Décision pour la clause 2' });
    await user.click(within(secondClause).getByRole('button', { name: 'Écarter' }));
    await user.type(within(review).getByLabelText(/Avocat en charge du dossier/), 'Me Martin');
    await user.type(
      within(review).getByLabelText('Conclusion pour le client (facultatif)'),
      'Nous écrivons à la banque.',
    );
    await user.click(within(review).getByRole('button', { name: 'Confirmer la validation' }));
    await user.click(within(review).getByRole('button', { name: 'Rédiger le mail amiable' }));

    await user.click(screen.getByRole('button', { name: 'Vue client' }));
    const updatedTracker = screen.getByRole('region', { name: 'Suivi de votre dossier' });
    expect(
      within(updatedTracker).getByText(/Me Martin a validé votre pré-analyse/),
    ).toBeInTheDocument();
    expect(within(updatedTracker).getByText('Déchéance du terme sans préavis')).toBeInTheDocument();
    expect(
      within(updatedTracker).queryByText('Clause de variation du taux'),
    ).not.toBeInTheDocument();
    expect(within(updatedTracker).getByText('Nous écrivons à la banque.')).toBeInTheDocument();
    expect(
      within(updatedTracker).getByText(/Discussion avec la banque en cours/),
    ).toBeInTheDocument();
    const updatedReport = screen.getByRole('region', { name: 'Rapport de pré-analyse' });
    expect(within(updatedReport).getByText('Confirmé par votre avocat')).toBeInTheDocument();
    expect(within(updatedReport).getByText('Écarté par votre avocat')).toBeInTheDocument();
    expect(within(updatedReport).queryByText('L’IA peut se tromper')).not.toBeInTheDocument();

    // L'avocat retrouve son dossier là où il l'a laissé.
    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));
    expect(screen.getByRole('heading', { name: 'Démarche amiable : le mail' })).toBeInTheDocument();
  }, 30_000);

  it('l’avocat ne reçoit le dossier qu’une fois transmis par le client', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await analyzeContract(user);
    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));
    const lawyerSpace = screen.getByRole('region', { name: 'Espace avocat' });
    expect(within(lawyerSpace).getByText(/pas encore transmise/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirmer la validation' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Vue client' }));
    await submitToLawyer(user);
    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));
    expect(screen.getByRole('button', { name: 'Confirmer la validation' })).toBeInTheDocument();
  }, 15_000);

  it('bascule entre vue avocat et vue client depuis la barre du haut', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await analyzeContract(user);
    await user.click(screen.getByRole('button', { name: 'Vue avocat' }));
    expect(screen.getByRole('region', { name: /Espace avocat/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vue avocat' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Vue client' }));
    expect(screen.getByRole('region', { name: 'Rapport de pré-analyse' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Espace avocat/ })).not.toBeInTheDocument();
  }, 15_000);
});
