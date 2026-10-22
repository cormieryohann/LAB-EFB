import type Anthropic from '@anthropic-ai/sdk';
import type {
  BetaContentBlockParam,
  BetaRequestDocumentBlock,
} from '@anthropic-ai/sdk/resources/beta/messages';
import type { z } from 'zod/v4';
import { ANALYSIS_SYSTEM_PROMPT, analysisInstruction } from '../prompts/analysisPrompt';
import { EMAIL_SYSTEM_PROMPT, emailInstruction } from '../prompts/emailPrompt';
import { LITIGATION_SYSTEM_PROMPT, litigationInstruction } from '../prompts/litigationPrompt';
import type { AmicableEmail, AmicableEmailInput } from '../types/amicableEmail';
import type { ContractAnalysis } from '../types/contractAnalysis';
import type { ContractContent } from '../types/contractDocument';
import type { LitigationBrief, LitigationInput } from '../types/litigation';

export const CLAUDE_MODEL = 'claude-opus-5-5';

/** Limite de l'API pour une requête, PDF encodés en base64 compris (marge pour le prompt). */
const MAX_REQUEST_BYTES = 30 * 1024 * 1024;

type AnthropicSdk = typeof Anthropic;

export interface DocumentToAnalyze {
  fileName: string;
  content: ContractContent;
}

/** Erreur dont le message peut être affiché tel quel à l'utilisateur. */
export class ClaudeServiceError extends Error {
  override name = 'ClaudeServiceError';
}

/** Le SDK pèse plus que le reste de l'application : chargé seulement au premier appel à l'IA. */
async function loadSdk(): Promise<AnthropicSdk> {
  const { default: sdk } = await import('@anthropic-ai/sdk');
  return sdk;
}

/**
 * Le site est statique (GitHub Pages) : c'est le navigateur qui appelle l'API, avec la clé que
 * l'utilisateur a saisie. Aucune clé n'est embarquée dans le build.
 */
export async function createClaudeClient(apiKey: string): Promise<Anthropic> {
  const Sdk = await loadSdk();
  return new Sdk({ apiKey, dangerouslyAllowBrowser: true });
}

function toUserError(
  error: unknown,
  Sdk: AnthropicSdk,
  fallbackMessage: string,
): ClaudeServiceError {
  if (error instanceof ClaudeServiceError) return error;
  if (error instanceof Sdk.AuthenticationError) {
    return new ClaudeServiceError(
      'Clé refusée par Anthropic : vérifiez qu’elle est complète et active.',
    );
  }
  if (error instanceof Sdk.PermissionDeniedError) {
    return new ClaudeServiceError('Cette clé n’a pas les droits nécessaires pour utiliser Claude.');
  }
  if (error instanceof Sdk.NotFoundError) {
    return new ClaudeServiceError(`Le modèle ${CLAUDE_MODEL} n’est pas disponible pour cette clé.`);
  }
  if (error instanceof Sdk.RateLimitError) {
    return new ClaudeServiceError('Trop de requêtes pour le moment : réessayez dans une minute.');
  }
  // APIConnectionError hérite d'APIError dans le SDK TypeScript : à tester avant.
  if (error instanceof Sdk.APIConnectionError) {
    return new ClaudeServiceError('Impossible de joindre Anthropic : vérifiez votre connexion.');
  }
  if (error instanceof Sdk.APIError) {
    return new ClaudeServiceError(
      'Anthropic a renvoyé une erreur. Réessayez dans quelques instants.',
    );
  }
  return new ClaudeServiceError(fallbackMessage);
}

/** Vérifie la clé sans consommer de jetons : la lecture d'un modèle n'est pas facturée. */
export async function verifyApiKey(apiKey: string): Promise<void> {
  const Sdk = await loadSdk();
  try {
    const client = await createClaudeClient(apiKey);
    await client.models.retrieve(CLAUDE_MODEL);
  } catch (error) {
    throw toUserError(error, Sdk, 'Erreur inattendue lors de la vérification de la clé.');
  }
}

/** Chaque fichier devient un bloc `document` titré, que Claude peut citer par son nom. */
export function toDocumentBlock({
  fileName,
  content,
}: DocumentToAnalyze): BetaRequestDocumentBlock {
  if (content.kind === 'pdf') {
    return {
      type: 'document',
      title: fileName,
      source: { type: 'base64', media_type: 'application/pdf', data: content.base64 },
    };
  }
  return {
    type: 'document',
    title: fileName,
    source: { type: 'text', media_type: 'text/plain', data: content.text },
    ...(content.approximate && {
      context:
        'Texte extrait de façon approximative d’un ancien fichier Word : des passages peuvent manquer ou être dans le désordre.',
    }),
  };
}

function requestSize(documents: DocumentToAnalyze[]): number {
  return documents.reduce(
    (total, { content }) =>
      total + (content.kind === 'pdf' ? content.base64.length : content.text.length * 2),
    0,
  );
}

/** Messages propres à chaque appel, pour les cas où la réponse ne peut pas être lue. */
interface StructuredRequestMessages {
  refusal: string;
  truncated: string;
  unexpected: string;
}

interface StructuredRequest<T> {
  apiKey: string;
  system: string;
  content: BetaContentBlockParam[];
  schema: z.ZodType<T>;
  effort: 'low' | 'medium' | 'high';
  maxTokens: number;
  messages: StructuredRequestMessages;
}

/**
 * Appel à Claude avec une réponse JSON imposée par un schéma Zod. En streaming : un contrat long
 * peut demander plusieurs minutes de travail, au-delà de ce qu'une requête simple tient sans
 * délai d'attente.
 */
async function runStructuredRequest<T>({
  apiKey,
  system,
  content,
  schema,
  effort,
  maxTokens,
  messages,
}: StructuredRequest<T>): Promise<T> {
  const Sdk = await loadSdk();
  const { betaZodOutputFormat } = await import('@anthropic-ai/sdk/helpers/beta/zod');
  let stopReason: string | null = null;

  // Une réponse refusée ou tronquée n'est pas du JSON valide : le SDK échoue en la lisant.
  const stopReasonError = (reason: string | null): ClaudeServiceError | undefined => {
    if (reason === 'refusal') return new ClaudeServiceError(messages.refusal);
    if (reason === 'max_tokens') return new ClaudeServiceError(messages.truncated);
    return undefined;
  };

  try {
    const client = await createClaudeClient(apiKey);
    const stream = client.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content }],
      output_config: { effort, format: betaZodOutputFormat(schema) },
      // Si les filtres de sécurité déclinent la demande, l'API la rejoue sur le modèle recommandé.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    stream.on('streamEvent', (_event, snapshot) => {
      stopReason = snapshot.stop_reason;
    });

    const message = await stream.finalMessage();
    const stopError = stopReasonError(message.stop_reason);
    if (stopError !== undefined) throw stopError;
    if (message.parsed_output === null) {
      throw new ClaudeServiceError('La réponse de l’IA est incomplète. Relancez la demande.');
    }
    return message.parsed_output;
  } catch (error) {
    throw stopReasonError(stopReason) ?? toUserError(error, Sdk, messages.unexpected);
  }
}

/** Pré-analyse des clauses contestables de l'ensemble des documents déposés. */
export async function analyzeContracts(
  apiKey: string,
  documents: DocumentToAnalyze[],
): Promise<ContractAnalysis> {
  if (requestSize(documents) > MAX_REQUEST_BYTES) {
    throw new ClaudeServiceError(
      'Les documents sont trop volumineux pour une seule analyse (30 Mo au total) : retirez-en un ou analysez-les séparément.',
    );
  }
  const { ContractAnalysisSchema } = await import('../types/contractAnalysis');

  return runStructuredRequest({
    apiKey,
    system: ANALYSIS_SYSTEM_PROMPT,
    content: [
      ...documents.map(toDocumentBlock),
      { type: 'text', text: analysisInstruction(documents.length) },
    ],
    schema: ContractAnalysisSchema,
    effort: 'high',
    maxTokens: 32000,
    messages: {
      refusal:
        'L’IA a refusé d’analyser ces documents. Vérifiez qu’il s’agit bien d’un contrat de crédit ou d’assurance.',
      truncated: 'La réponse de l’IA a été interrompue : analysez moins de documents à la fois.',
      unexpected: 'Erreur inattendue pendant la pré-analyse.',
    },
  });
}

/**
 * Rédaction du mail de la démarche amiable, à partir des seules clauses retenues par l'avocat :
 * les documents ne sont pas renvoyés, les extraits cités suffisent.
 */
export async function draftAmicableEmail(
  apiKey: string,
  input: AmicableEmailInput,
): Promise<AmicableEmail> {
  const { AmicableEmailSchema } = await import('../types/amicableEmail');

  return runStructuredRequest({
    apiKey,
    system: EMAIL_SYSTEM_PROMPT,
    content: [{ type: 'text', text: emailInstruction(input) }],
    schema: AmicableEmailSchema,
    effort: 'medium',
    maxTokens: 16000,
    messages: {
      refusal: 'L’IA a refusé de rédiger ce mail. Reformulez la conclusion de l’avocat.',
      truncated: 'Le mail rédigé par l’IA a été interrompu. Relancez la rédaction.',
      unexpected: 'Erreur inattendue pendant la rédaction du mail.',
    },
  });
}

/** Projet d'assignation de la procédure contentieuse, à partir du dossier validé par l'avocat. */
export async function draftLitigationBrief(
  apiKey: string,
  input: LitigationInput,
): Promise<LitigationBrief> {
  const { LitigationBriefSchema } = await import('../types/litigation');

  return runStructuredRequest({
    apiKey,
    system: LITIGATION_SYSTEM_PROMPT,
    content: [{ type: 'text', text: litigationInstruction(input) }],
    schema: LitigationBriefSchema,
    effort: 'high',
    maxTokens: 32000,
    messages: {
      refusal: 'L’IA a refusé de rédiger ce projet d’acte. Reformulez la conclusion de l’avocat.',
      truncated: 'Le projet d’acte rédigé par l’IA a été interrompu. Relancez la rédaction.',
      unexpected: 'Erreur inattendue pendant la rédaction du projet d’acte.',
    },
  });
}
