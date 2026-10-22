import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClaudeServiceError, analyzeContracts } from '../services/ClaudeService';
import type * as ClaudeServiceModule from '../services/ClaudeService';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { renderWithProviders } from '../test/renderWithProviders';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { UploadPage } from './UploadPage';

vi.mock('../services/ClaudeService', async (importOriginal) => ({
  ...(await importOriginal<typeof ClaudeServiceModule>()),
  analyzeContracts: vi.fn(),
}));

const CONTRACT_TEXT = 'La banque peut prononcer la déchéance du terme.';

const ANALYSIS: ContractAnalysis = {
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

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));
    await user.click(await screen.findByRole('button', { name: 'Validation avocat' }));

    const review = screen.getByRole('region', { name: /Espace avocat/ });
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
  }, 15_000);

  it('revient au rapport client depuis l’espace avocat', async () => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    vi.mocked(analyzeContracts).mockResolvedValue(ANALYSIS);
    const user = userEvent.setup();
    renderWithProviders(<UploadPage />);

    await uploadContract(user);
    await user.click(screen.getByRole('button', { name: 'Lancer la pré-analyse' }));
    await user.click(await screen.findByRole('button', { name: 'Validation avocat' }));
    await user.click(screen.getByRole('button', { name: 'Revenir au rapport' }));

    expect(screen.getByRole('region', { name: 'Rapport de pré-analyse' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /Documents déposés/ })).toBeInTheDocument();
  });
});
