/** Destinations RTF qui ne contiennent pas le texte du document (tables, métadonnées, images…). */
const SKIPPED_DESTINATIONS = new Set([
  'fonttbl',
  'colortbl',
  'stylesheet',
  'info',
  'pict',
  'object',
  'header',
  'headerl',
  'headerr',
  'headerf',
  'footer',
  'footerl',
  'footerr',
  'footerf',
  'listtable',
  'listoverridetable',
  'rsidtbl',
  'xmlnstbl',
  'themedata',
  'colorschememapping',
  'latentstyles',
  'datastore',
  'generator',
  'fldinst',
]);

const BREAKS: Record<string, string> = {
  par: '\n',
  line: '\n',
  sect: '\n\n',
  page: '\n\n',
  tab: '\t',
};

interface GroupState {
  skip: boolean;
  unicodeSkipCount: number;
}

const cp1252 = new TextDecoder('windows-1252');

/** Extrait le texte brut d'un document RTF (parcours des groupes et mots de contrôle). */
export function rtfToText(rtf: string): string {
  const stack: GroupState[] = [];
  let state: GroupState = { skip: false, unicodeSkipCount: 1 };
  let pendingSkip = 0;
  let output = '';

  const emit = (text: string): void => {
    if (pendingSkip > 0) {
      pendingSkip -= 1;
      return;
    }
    if (!state.skip) output += text;
  };

  let index = 0;
  while (index < rtf.length) {
    const char = rtf[index];

    if (char === '{') {
      stack.push(state);
      state = { ...state };
      index += 1;
    } else if (char === '}') {
      state = stack.pop() ?? state;
      index += 1;
    } else if (char === '\\') {
      const next = rtf[index + 1] ?? '';
      if (/[a-z]/i.test(next)) {
        const match = /^\\([a-z]+)(-?\d+)? ?/i.exec(rtf.slice(index, index + 40));
        const word = match?.[1] ?? next;
        const parameter = match?.[2] === undefined ? undefined : Number(match[2]);
        index += match?.[0].length ?? 2;

        if (SKIPPED_DESTINATIONS.has(word)) {
          state.skip = true;
        } else if (word === 'uc' && parameter !== undefined) {
          state.unicodeSkipCount = parameter;
        } else if (word === 'u' && parameter !== undefined) {
          emit(String.fromCharCode(parameter < 0 ? parameter + 65536 : parameter));
          pendingSkip = state.unicodeSkipCount;
        } else if (word in BREAKS) {
          emit(BREAKS[word]);
        }
      } else if (next === "'") {
        const byte = Number.parseInt(rtf.slice(index + 2, index + 4), 16);
        emit(cp1252.decode(new Uint8Array([byte])));
        index += 4;
      } else {
        if (next === '*') state.skip = true;
        else if (next === '~') emit(' ');
        else if (next === '_') emit('-');
        else if (next === '\\' || next === '{' || next === '}') emit(next);
        else if (next === '\n' || next === '\r') emit('\n');
        index += 2;
      }
    } else {
      if (char !== '\n' && char !== '\r') emit(char);
      index += 1;
    }
  }

  return output
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
