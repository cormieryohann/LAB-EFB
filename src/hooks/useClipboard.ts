import { useState } from 'react';

interface Clipboard {
  copy: (text: string) => Promise<void>;
  /** Message de confirmation ou d'échec à afficher, effacé par `clearMessage`. */
  message?: string;
  clearMessage: () => void;
}

export function useClipboard(successMessage: string): Clipboard {
  const [message, setMessage] = useState<string>();

  const copy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successMessage);
    } catch {
      setMessage('Copie impossible : sélectionnez le texte pour le copier.');
    }
  };

  return { copy, message, clearMessage: () => setMessage(undefined) };
}
