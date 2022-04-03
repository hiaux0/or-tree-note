import { Cursor, VimMode } from './vim-types';

export class VimStateClass {
  constructor(
    public cursor: Cursor,
    public lines: string[],
    public mode?: VimMode,
    public visualStartCursor?: Cursor,
    public visualEndCursor?: Cursor
  ) {}

  public getActiveLine() {
    const active = this.lines[this.cursor.line];
    return active;
  }

  public updateActiveLine(updated: string) {
    this.lines[this.cursor.line] = updated;
  }
}
