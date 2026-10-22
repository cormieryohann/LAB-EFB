import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { verifyApiKey } from '../../services/ClaudeService';
import type { ClaudeServiceError } from '../../services/ClaudeService';

export function useVerifyApiKey(): UseMutationResult<void, ClaudeServiceError, string> {
  return useMutation<void, ClaudeServiceError, string>({
    mutationFn: (apiKey) => verifyApiKey(apiKey),
  });
}
