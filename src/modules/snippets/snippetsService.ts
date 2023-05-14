import { USER_SNIPPETS } from 'resources/keybindings/snippets/snippets';

export class SnippetsService {
  public static stringOrArrayToString(input: string | string[]) {
    let finalInput = '';
    if (typeof input === 'string') {
      finalInput = input;
    } else if (Array.isArray(input)) {
      finalInput = input.join('');
    }
    return finalInput;
  }

  public static findByPrefix(input: string | string[]) {
    const finalInput = this.stringOrArrayToString(input);
    const targetSnippet = USER_SNIPPETS.find((snippet) => {
      const is = snippet.prefix === finalInput;
      return is;
    });

    return targetSnippet;
  }

  public static filterByPrefix(input: string | string[]) {
    const finalInput = this.stringOrArrayToString(input);
    const targetSnippet = USER_SNIPPETS.find((snippet) => {
      const is = snippet.prefix.startsWith(finalInput);
      return is;
    });

    return targetSnippet;
  }

  public static containsPrefix(input: string | string[]) {
    const filtered = this.filterByPrefix(input);
    return !!filtered;
  }

  public executeSnippet() {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: snippetsService.ts ~ line 7 ~ SNIPPETS', USER_SNIPPETS);
  }
}
