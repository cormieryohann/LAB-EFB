import { create } from 'zustand';

const STORAGE_KEY = 'vigicontrat.anthropicApiKey';

interface ApiKeyState {
  apiKey: string | null;
  /** `true` si la clé est gardée en localStorage (case « se souvenir »), sinon en sessionStorage. */
  remembered: boolean;
  saveApiKey: (apiKey: string, remember: boolean) => void;
  clearApiKey: () => void;
}

/**
 * Pas de middleware `persist` : il n'écrit que dans un seul stockage, alors que la clé va en
 * sessionStorage par défaut (effacée à la fermeture de l'onglet) et en localStorage sur demande.
 */
function readStoredKey(): Pick<ApiKeyState, 'apiKey' | 'remembered'> {
  const remembered = localStorage.getItem(STORAGE_KEY);
  if (remembered !== null) return { apiKey: remembered, remembered: true };
  return { apiKey: sessionStorage.getItem(STORAGE_KEY), remembered: false };
}

export const useApiKeyStore = create<ApiKeyState>()((set) => ({
  ...readStoredKey(),
  saveApiKey: (apiKey, remember) => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, apiKey);
    set({ apiKey, remembered: remember });
  },
  clearApiKey: () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    set({ apiKey: null, remembered: false });
  },
}));
