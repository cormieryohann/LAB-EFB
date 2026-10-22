import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { draftLitigationBrief } from '../../services/ClaudeService';
import type { ClaudeServiceError } from '../../services/ClaudeService';
import type { LitigationBrief, LitigationInput } from '../../types/litigation';

export interface DraftLitigationBriefInput {
  apiKey: string;
  input: LitigationInput;
}

export function useDraftLitigationBrief(): UseMutationResult<
  LitigationBrief,
  ClaudeServiceError,
  DraftLitigationBriefInput
> {
  return useMutation<LitigationBrief, ClaudeServiceError, DraftLitigationBriefInput>({
    mutationFn: ({ apiKey, input }) => draftLitigationBrief(apiKey, input),
  });
}
