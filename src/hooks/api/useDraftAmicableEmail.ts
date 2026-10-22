import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { draftAmicableEmail } from '../../services/ClaudeService';
import type { ClaudeServiceError } from '../../services/ClaudeService';
import type { AmicableEmail, AmicableEmailInput } from '../../types/amicableEmail';

export interface DraftAmicableEmailInput {
  apiKey: string;
  input: AmicableEmailInput;
}

export function useDraftAmicableEmail(): UseMutationResult<
  AmicableEmail,
  ClaudeServiceError,
  DraftAmicableEmailInput
> {
  return useMutation<AmicableEmail, ClaudeServiceError, DraftAmicableEmailInput>({
    mutationFn: ({ apiKey, input }) => draftAmicableEmail(apiKey, input),
  });
}
