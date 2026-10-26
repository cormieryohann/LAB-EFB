import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContractAnalysis } from '../types/contractAnalysis';
import { EMPTY_CASE_DETAILS } from '../test/caseDetails';
import {
  CLAUDE_MODEL,
  analyzeContracts,
  draftAmicableEmail,
  draftLitigationBrief,
  toDocumentBlock,
  verifyApiKey,
} from './ClaudeService';

function mockFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Réponse en streaming (Server-Sent Events) telle que l'API Messages l'envoie. */
function mockStreamedMessage(text: string, stopReason: string): ReturnType<typeof vi.fn> {
  const events = [
    {
      type: 'message_start',
      message: {
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        model: CLAUDE_MODEL,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 100, output_tokens: 1 },
      },
    },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } },
    { type: 'content_block_stop', index: 0 },
    {
      type: 'message_delta',
      delta: { stop_reason: stopReason, stop_sequence: null },
      usage: { output_tokens: 200 },
    },
    { type: 'message_stop' },
  ];
  const body = events
    .map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
    .join('');
  const fetchMock = vi.fn(
    async () =>
      new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const ANALYSIS: ContractAnalysis = {
  caseDetails: {
    ...EMPTY_CASE_DETAILS,
    borrowers: [{ name: 'Camille Durand', address: null }],
    loanReference: 'PR-2019-4471',
  },
  summary: 'Offre de prêt immobilier de 200 000 € sur 20 ans.',
  clauses: [
    {
      title: 'Déchéance du terme après 15 jours',
      category: 'decheance_terme',
      documentName: 'offre.pdf',
      excerpt: 'Le prêt sera exigible 15 jours après une mise en demeure restée sans effet.',
      explanation: 'Le délai de 15 jours est trop court pour régulariser un impayé.',
      legalBasis: 'Cass. civ. 1re, 29 mai 2024',
      potentialGain: 'Annulation de la déchéance du terme.',
      strength: 'forte',
    },
  ],
  risks: 'La banque peut exiger tout le capital restant dû.',
  timeline: 'Prescription de 5 ans.',
  missingInformation: [],
};

const DOCUMENTS = [
  { fileName: 'offre.pdf', content: { kind: 'pdf' as const, base64: 'JVBERi0=' } },
  {
    fileName: 'ancien.doc',
    content: { kind: 'text' as const, text: 'Article 1', approximate: true },
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('verifyApiKey', () => {
  it('accepte une clé qui donne accès au modèle', async () => {
    const fetchMock = mockFetch(200, { id: CLAUDE_MODEL, type: 'model' });

    await expect(verifyApiKey('sk-ant-valide')).resolves.toBeUndefined();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`/v1/models/${CLAUDE_MODEL}`);
  });

  it('traduit un refus d’authentification en message lisible', async () => {
    mockFetch(401, {
      type: 'error',
      error: { type: 'authentication_error', message: 'invalid x-api-key' },
    });

    await expect(verifyApiKey('sk-ant-invalide')).rejects.toThrow(/Clé refusée par Anthropic/);
  });
});

describe('toDocumentBlock', () => {
  it('envoie un PDF en base64 et signale un texte extrait approximativement', () => {
    expect(toDocumentBlock(DOCUMENTS[0])).toEqual({
      type: 'document',
      title: 'offre.pdf',
      source: { type: 'base64', media_type: 'application/pdf', data: 'JVBERi0=' },
    });
    expect(toDocumentBlock(DOCUMENTS[1])).toMatchObject({
      title: 'ancien.doc',
      source: { type: 'text', media_type: 'text/plain', data: 'Article 1' },
      context: expect.stringContaining('approximative'),
    });
  });
});

describe('analyzeContracts', () => {
  it('envoie les documents et le référentiel, puis renvoie le rapport structuré', async () => {
    const fetchMock = mockStreamedMessage(JSON.stringify(ANALYSIS), 'end_turn');

    await expect(analyzeContracts('sk-ant-test', DOCUMENTS)).resolves.toEqual(ANALYSIS);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(url).toContain('/v1/messages');
    expect(new Headers(init.headers).get('anthropic-beta')).toContain(
      'server-side-fallback-2026-07-01',
    );
    expect(body).toMatchObject({
      model: CLAUDE_MODEL,
      stream: true,
      fallbacks: 'default',
      output_config: { effort: 'high', format: { type: 'json_schema' } },
    });
    expect(body.system).toContain('déchéance du terme');
    expect(JSON.stringify(body.messages)).toContain('"title":"offre.pdf"');
  });

  it('explique un refus de l’IA', async () => {
    mockStreamedMessage('', 'refusal');

    await expect(analyzeContracts('sk-ant-test', DOCUMENTS)).rejects.toThrow(
      /L’IA a refusé d’analyser ces documents/,
    );
  });

  it('refuse un envoi trop volumineux sans appeler l’API', async () => {
    const fetchMock = mockFetch(200, {});
    const huge = [
      {
        fileName: 'gros.pdf',
        content: { kind: 'pdf' as const, base64: 'A'.repeat(31 * 1024 * 1024) },
      },
    ];

    await expect(analyzeContracts('sk-ant-test', huge)).rejects.toThrow(/trop volumineux/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('draftAmicableEmail', () => {
  it('envoie les consignes et les clauses retenues, puis renvoie le mail', async () => {
    const email = { subject: 'Réclamation', body: 'Madame, Monsieur,' };
    const fetchMock = mockStreamedMessage(JSON.stringify(email), 'end_turn');

    await expect(
      draftAmicableEmail('sk-ant-test', {
        recipient: 'banque',
        lawyerName: 'Me Martin',
        conclusion: 'Obtenir la renonciation aux pénalités.',
        summary: ANALYSIS.summary,
        caseDetails: ANALYSIS.caseDetails,
        retainedClauses: [{ clause: ANALYSIS.clauses[0], decision: 'validee', note: 'Solide' }],
      }),
    ).resolves.toEqual(email);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      system: string;
      messages: { content: { text: string }[] }[];
    };
    expect(body).toMatchObject({ output_config: { effort: 'medium' } });
    expect(body.system).toContain('Consignes de rédaction du mail amiable');
    const instruction = body.messages[0]?.content[0]?.text ?? '';
    expect(instruction).toContain('service réclamations de la banque');
    expect(instruction).toContain('Emprunteur : Camille Durand');
    expect(instruction).toContain('Référence du prêt : PR-2019-4471');
    expect(instruction).not.toContain('TAEG / TEG');
    expect(instruction).toContain('Déchéance du terme après 15 jours');
    expect(instruction).toContain("Note de l'avocat : Solide");
    expect(instruction).toContain('Obtenir la renonciation aux pénalités.');
    expect(JSON.stringify(body)).not.toContain('"type":"document"');
  });
});

describe('draftLitigationBrief', () => {
  it('envoie les consignes, les clauses retenues et le bordereau numéroté', async () => {
    const brief = { title: 'Projet d’assignation', body: 'PAR CES MOTIFS' };
    const fetchMock = mockStreamedMessage(JSON.stringify(brief), 'end_turn');

    await expect(
      draftLitigationBrief('sk-ant-test', {
        lawyerName: 'Me Martin',
        conclusion: '',
        summary: ANALYSIS.summary,
        caseDetails: ANALYSIS.caseDetails,
        retainedClauses: [{ clause: ANALYSIS.clauses[0], decision: 'a_approfondir', note: '' }],
        exhibits: ['Contrat et annexes : offre.pdf', 'Réponse à la démarche amiable'],
        amicableOutcome: 'Refus de la banque.',
      }),
    ).resolves.toEqual(brief);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      system: string;
      messages: { content: { text: string }[] }[];
    };
    expect(body).toMatchObject({ output_config: { effort: 'high' } });
    expect(body.system).toContain("Consignes de rédaction du projet d'assignation");
    const instruction = body.messages[0]?.content[0]?.text ?? '';
    expect(instruction).toContain('Pièce n° 2 : Réponse à la démarche amiable');
    expect(instruction).toContain('Décision : à approfondir');
    expect(instruction).toContain('Refus de la banque.');
  });
});
