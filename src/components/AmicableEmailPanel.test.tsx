import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { draftAmicableEmail } from '../services/ClaudeService';
import type * as ClaudeServiceModule from '../services/ClaudeService';
import { useAmicableEmailStore } from '../stores/useAmicableEmailStore';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { renderWithProviders } from '../test/renderWithProviders';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { AmicableEmailPanel } from './AmicableEmailPanel';

vi.mock('../services/ClaudeService', async (importOriginal) => ({
  ...(await importOriginal<typeof ClaudeServiceModule>()),
  draftAmicableEmail: vi.fn(),
}));

const DECHEANCE = {
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
  summary: 'Crédit immobilier de 200 000 €.',
  clauses: [
    {
      ...DECHEANCE,
      title: 'Variation du taux',
      category: 'modification_unilaterale',
      strength: 'faible',
    },
    DECHEANCE,
  ],
  risks: 'Remboursement immédiat.',
  timeline: '5 ans.',
  missingInformation: [],
};

describe('AmicableEmailPanel', () => {
  beforeEach(() => {
    useApiKeyStore.setState({ apiKey: 'sk-ant-test' });
    useAmicableEmailStore.getState().resetEmail();
    // Ordre trié : 0 = déchéance du terme (forte), 1 = variation du taux (faible).
    useLawyerReviewStore.setState({
      reviews: {
        0: { decision: 'validee', note: 'Jurisprudence favorable' },
        1: { decision: 'ecartee', note: '' },
      },
      lawyerName: 'Me Martin',
      conclusion: 'Demander l’annulation de la déchéance.',
      validatedAt: '2026-10-22T10:00:00.000Z',
    });
    vi.mocked(draftAmicableEmail).mockReset();
  });

  it('rédige le mail à partir des seules clauses retenues, pour le destinataire choisi', async () => {
    vi.mocked(draftAmicableEmail).mockResolvedValue({
      subject: 'Contestation de la clause de déchéance du terme',
      body: 'Madame, Monsieur,\n\nPrêt n° [Numéro du prêt] au nom de [Nom du client].\n\nMe Martin',
    });
    const user = userEvent.setup();
    renderWithProviders(
      <AmicableEmailPanel analysis={ANALYSIS} onBack={vi.fn()} onLitigation={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Médiateur bancaire' }));
    await user.click(screen.getByRole('button', { name: 'Rédiger le mail avec l’IA' }));

    expect(await screen.findByLabelText('Objet')).toHaveValue(
      'Contestation de la clause de déchéance du terme',
    );
    expect(draftAmicableEmail).toHaveBeenCalledWith('sk-ant-test', {
      recipient: 'mediateur',
      lawyerName: 'Me Martin',
      conclusion: 'Demander l’annulation de la déchéance.',
      summary: 'Crédit immobilier de 200 000 €.',
      retainedClauses: [
        { clause: DECHEANCE, decision: 'validee', note: 'Jurisprudence favorable' },
      ],
    });
    expect(
      screen.getByText('À compléter avant l’envoi : [Numéro du prêt], [Nom du client]'),
    ).toBeInTheDocument();
  });

  it('prépare le mail pour la messagerie avec l’objet et le texte modifiés', async () => {
    useAmicableEmailStore.getState().setDraft({ subject: 'Objet initial', body: 'Texte' });
    const user = userEvent.setup();
    renderWithProviders(
      <AmicableEmailPanel analysis={ANALYSIS} onBack={vi.fn()} onLitigation={vi.fn()} />,
    );

    const subject = screen.getByLabelText('Objet');
    await user.clear(subject);
    await user.paste('Réclamation prêt');
    await user.click(screen.getByLabelText('Adresse du destinataire'));
    await user.paste('reclamations@banque.fr');

    const mailLink = screen.getByRole('link', { name: 'Ouvrir dans ma messagerie' });
    expect(mailLink).toHaveAttribute(
      'href',
      'mailto:reclamations%40banque.fr?subject=R%C3%A9clamation%20pr%C3%AAt&body=Texte',
    );
    expect(
      within(screen.getByRole('region', { name: /Démarche amiable/ })).getByText(
        /1 clause retenue/,
      ),
    ).toBeInTheDocument();
  });

  it('affiche l’erreur de rédaction', async () => {
    const { ClaudeServiceError } = await import('../services/ClaudeService');
    vi.mocked(draftAmicableEmail).mockRejectedValue(new ClaudeServiceError('Quota dépassé.'));
    const user = userEvent.setup();
    renderWithProviders(
      <AmicableEmailPanel analysis={ANALYSIS} onBack={vi.fn()} onLitigation={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Rédiger le mail avec l’IA' }));

    expect(await screen.findByText('Quota dépassé.')).toBeInTheDocument();
  });
});
