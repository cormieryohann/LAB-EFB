import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { draftLitigationBrief } from '../services/ClaudeService';
import type * as ClaudeServiceModule from '../services/ClaudeService';
import { useAmicableEmailStore } from '../stores/useAmicableEmailStore';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { useLitigationStore } from '../stores/useLitigationStore';
import { EMPTY_CASE_DETAILS } from '../test/caseDetails';
import { renderWithProviders } from '../test/renderWithProviders';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { LitigationPanel } from './LitigationPanel';

vi.mock('../services/ClaudeService', async (importOriginal) => ({
  ...(await importOriginal<typeof ClaudeServiceModule>()),
  draftLitigationBrief: vi.fn(),
}));

const CLAUSE = {
  title: 'Déchéance du terme sans préavis',
  category: 'decheance_terme' as const,
  documentName: 'offre.pdf',
  excerpt: 'Le prêt sera exigible sans mise en demeure.',
  explanation: 'Aucun délai pour régulariser.',
  legalBasis: 'Cass. civ. 1re, 29 mai 2024',
  potentialGain: 'Annulation de la déchéance.',
  strength: 'forte' as const,
};

const ANALYSIS: ContractAnalysis = {
  caseDetails: EMPTY_CASE_DETAILS,
  summary: 'Crédit immobilier de 200 000 €.',
  clauses: [CLAUSE],
  risks: 'Saisie.',
  timeline: '5 ans.',
  missingInformation: [],
};

function renderPanel(): void {
  renderWithProviders(<LitigationPanel analysis={ANALYSIS} onBack={vi.fn()} />);
}

describe('LitigationPanel', () => {
  beforeEach(() => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    useDocumentStore.setState({
      documents: [
        {
          id: '1',
          fileName: 'offre.pdf',
          sizeBytes: 10,
          format: 'pdf',
          status: 'ready',
          content: { kind: 'pdf', base64: 'JVBERi0=' },
        },
      ],
    });
    useLawyerReviewStore.setState({
      reviews: { 0: { decision: 'validee', note: '' } },
      lawyerName: 'Me Martin',
      conclusion: '',
      validatedAt: '2026-10-22T10:00:00.000Z',
    });
    useAmicableEmailStore.getState().resetEmail();
    useLitigationStore.getState().resetLitigation();
    vi.mocked(draftLitigationBrief).mockReset();
  });

  it('rappelle l’obligation d’amiable quand aucune démarche n’a été préparée', () => {
    renderPanel();

    expect(
      screen.getByText(/une tentative de résolution amiable est obligatoire/),
    ).toBeInTheDocument();
  });

  it('numérote les pièces et les transmet à l’IA avec le résultat de l’amiable', async () => {
    useAmicableEmailStore.getState().setDraft({ subject: 'Réclamation prêt', body: '…' });
    vi.mocked(draftLitigationBrief).mockResolvedValue({
      title: 'Projet d’assignation',
      body: 'DEVANT LE [Juridiction compétente]\n\nPièce n° 1 : offre de prêt.',
    });
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByLabelText('Résultat de la démarche amiable (facultatif)'));
    await user.paste('Refus de la banque.');

    const exhibits = screen.getByRole('list', { name: 'Bordereau de pièces' });
    expect(
      within(exhibits)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Contrat et annexes : offre.pdf',
      'Mail de réclamation amiable : « Réclamation prêt »',
      'Réponse à la démarche amiable',
    ]);
    expect(
      screen.queryByText(/une tentative de résolution amiable est obligatoire/),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rédiger le projet d’assignation' }));

    expect(await screen.findByLabelText('Projet d’acte')).toHaveValue(
      'DEVANT LE [Juridiction compétente]\n\nPièce n° 1 : offre de prêt.',
    );
    expect(draftLitigationBrief).toHaveBeenCalledWith(
      'sk-ant-test',
      expect.objectContaining({
        lawyerName: 'Me Martin',
        amicableOutcome: 'Refus de la banque.',
        exhibits: [
          'Contrat et annexes : offre.pdf',
          'Mail de réclamation amiable : « Réclamation prêt »',
          'Réponse à la démarche amiable',
        ],
        retainedClauses: [{ clause: CLAUSE, decision: 'validee', note: '' }],
      }),
    );
    expect(screen.getByText('À compléter : [Juridiction compétente]')).toBeInTheDocument();
  });
});
