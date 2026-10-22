import { useState } from 'react';
import { useApiKeyStore } from '../stores/useApiKeyStore';
import { useAmicableEmailStore } from '../stores/useAmicableEmailStore';
import { useLawyerReviewStore } from '../stores/useLawyerReviewStore';
import { useLitigationStore } from '../stores/useLitigationStore';
import type { ContractAnalysis } from '../types/contractAnalysis';
import type { UploadedDocument } from '../types/contractDocument';
import type { ClaudeServiceError } from '../services/ClaudeService';
import { useAnalyzeContracts } from './api/useAnalyzeContracts';

export interface ContractAnalysisState {
  analysis?: ContractAnalysis;
  error: ClaudeServiceError | null;
  isPending: boolean;
  /** Les documents déposés ne sont plus ceux qui ont été analysés. */
  isStale: boolean;
  /** Au moins un document est lu et aucun n'est en cours de lecture. */
  canLaunch: boolean;
  isReading: boolean;
  launch: () => void;
}

function documentsSignature(documents: UploadedDocument[]): string {
  return documents.map((document) => document.id).join('|');
}

/**
 * État de la pré-analyse, porté par la page : il survit au passage dans l'espace avocat, qui
 * démonte le panneau d'analyse.
 */
export function useContractAnalysis(documents: UploadedDocument[]): ContractAnalysisState {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  const resetReview = useLawyerReviewStore((state) => state.resetReview);
  const resetEmail = useAmicableEmailStore((state) => state.resetEmail);
  const resetLitigation = useLitigationStore((state) => state.resetLitigation);
  const mutation = useAnalyzeContracts();
  const [analyzedSignature, setAnalyzedSignature] = useState<string>();

  const readyDocuments = documents.filter((document) => document.status === 'ready');
  const isReading = documents.some((document) => document.status === 'processing');

  const launch = (): void => {
    if (apiKey === null) return;
    setAnalyzedSignature(documentsSignature(readyDocuments));
    resetReview();
    resetEmail();
    resetLitigation();
    mutation.mutate({
      apiKey,
      documents: readyDocuments.flatMap(({ fileName, content }) =>
        content === undefined ? [] : [{ fileName, content }],
      ),
    });
  };

  return {
    analysis: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
    isStale: mutation.isSuccess && analyzedSignature !== documentsSignature(readyDocuments),
    canLaunch: apiKey !== null && readyDocuments.length > 0 && !isReading,
    isReading,
    launch,
  };
}
