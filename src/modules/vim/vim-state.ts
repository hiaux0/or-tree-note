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

  public getActiveLine() {
    const active = this.lines[this.cursor.line];
    return active;
  }

  public updateActiveLine(updated: string) {
    this.lines[this.cursor.line] = updated;
  }
}
