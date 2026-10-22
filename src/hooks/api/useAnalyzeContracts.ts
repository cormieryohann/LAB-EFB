import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { analyzeContracts } from '../../services/ClaudeService';
import type { ClaudeServiceError, DocumentToAnalyze } from '../../services/ClaudeService';
import type { ContractAnalysis } from '../../types/contractAnalysis';

export interface AnalyzeContractsInput {
  apiKey: string;
  documents: DocumentToAnalyze[];
}

export function useAnalyzeContracts(): UseMutationResult<
  ContractAnalysis,
  ClaudeServiceError,
  AnalyzeContractsInput
> {
  return useMutation<ContractAnalysis, ClaudeServiceError, AnalyzeContractsInput>({
    mutationFn: ({ apiKey, documents }) => analyzeContracts(apiKey, documents),
  });
}
