import { Cursor, VimMode, VimState } from './vim-types';

export class VimStateClass {
  constructor(
    public cursor: Cursor,
    public lines: string[],
    public text?: string,
    public mode: VimMode = VimMode.NORMAL,
    public visualStartCursor?: Cursor,
    public visualEndCursor?: Cursor
  ) {}

  public static create(cursor: Cursor, lines?: string[], text?: string) {
    return new VimStateClass(cursor, lines, text);
  }

  public serialize(): VimState {
    return {
      cursor: this.cursor,
      lines: this.lines,
      text: this.text,
      mode: this.mode,
      visualStartCursor: this.visualStartCursor,
      visualEndCursor: this.visualEndCursor,
    };
  }

  public getLineAt(lineIndex: number) {
    const line = this.lines[lineIndex];
    return line;
  }

  public getActiveLine() {
    const active = this.getLineAt(this.cursor.line);
    return active;
  }

  public getPreviousLine() {
    const previous = this.getLineAt(this.cursor.line - 1);
    return previous;
  }

  public updateActiveLine(updated: string) {
    this.lines; /* ? */
    this.cursor.line; /* ? */
    updated; /* ? */
    this.lines[this.cursor.line] = updated;
    // this.lines[this.cursor.line] = 'si';
    this.lines; /* ? */
  }
}
