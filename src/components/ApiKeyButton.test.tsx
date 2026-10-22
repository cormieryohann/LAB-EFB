import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClaudeServiceError, verifyApiKey } from '../services/ClaudeService';
import type * as ClaudeServiceModule from '../services/ClaudeService';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { ApiKeyButton } from './ApiKeyButton';

vi.mock('../services/ClaudeService', async (importOriginal) => ({
  ...(await importOriginal<typeof ClaudeServiceModule>()),
  verifyApiKey: vi.fn(),
}));

const STORAGE_KEY = 'vigicontrat.anthropicApiKey';
const VALID_KEY = 'sk-ant-api03-test';

function renderButton(): void {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ApiKeyButton />
    </QueryClientProvider>,
  );
}

describe('ApiKeyButton', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useApiKeyStore.setState({ apiKey: null, remembered: false });
    vi.mocked(verifyApiKey).mockReset();
  });

  it('enregistre une clé vérifiée pour la session uniquement', async () => {
    vi.mocked(verifyApiKey).mockResolvedValue();
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Ajouter ma clé Claude' }));
    await user.type(screen.getByLabelText('Clé API'), VALID_KEY);
    await user.click(screen.getByRole('button', { name: 'Vérifier et enregistrer' }));

    expect(await screen.findByRole('button', { name: 'Clé Claude active' })).toBeInTheDocument();
    expect(verifyApiKey).toHaveBeenCalledWith(VALID_KEY);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(VALID_KEY);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('garde la clé sur l’appareil quand l’utilisateur le demande', async () => {
    vi.mocked(verifyApiKey).mockResolvedValue();
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Ajouter ma clé Claude' }));
    await user.type(screen.getByLabelText('Clé API'), VALID_KEY);
    await user.click(screen.getByLabelText('Se souvenir de la clé sur cet appareil'));
    await user.click(screen.getByRole('button', { name: 'Vérifier et enregistrer' }));

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBe(VALID_KEY));
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('affiche le refus d’Anthropic et n’enregistre rien', async () => {
    vi.mocked(verifyApiKey).mockRejectedValue(new ClaudeServiceError('Clé refusée par Anthropic.'));
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Ajouter ma clé Claude' }));
    await user.type(screen.getByLabelText('Clé API'), VALID_KEY);
    await user.click(screen.getByRole('button', { name: 'Vérifier et enregistrer' }));

    expect(await screen.findByText('Clé refusée par Anthropic.')).toBeInTheDocument();
    expect(useApiKeyStore.getState().apiKey).toBeNull();
  });

  it('signale une clé mal formée sans appeler Anthropic', async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Ajouter ma clé Claude' }));
    await user.type(screen.getByLabelText('Clé API'), 'mauvaise-cle');

    expect(screen.getByText('Une clé Anthropic commence par « sk-ant- ».')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vérifier et enregistrer' })).toBeDisabled();
  });

  it('supprime une clé enregistrée', async () => {
    useApiKeyStore.getState().saveApiKey(VALID_KEY, true);
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole('button', { name: 'Clé Claude active' }));
    await user.click(screen.getByRole('button', { name: 'Supprimer la clé' }));

    expect(screen.getByRole('button', { name: 'Ajouter ma clé Claude' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
