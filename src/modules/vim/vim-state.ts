import { Cursor, VimMode, VimState } from './vim-types';

export class VimStateClass {
  cursor: Cursor;
  lines: string[];
  text: string;
  mode: VimMode;
  visualStartCursor: Cursor;
  visualEndCursor: Cursor;
  deletedLinesIndeces: number[];
  commandName: string;

  constructor(public vimState: VimState) {
    this.cursor = vimState.cursor;
    this.lines = vimState.lines;
    this.text = vimState.text;
    this.mode = vimState.mode ?? VimMode.NORMAL;
    this.visualStartCursor = vimState.visualStartCursor;
    this.visualEndCursor = vimState.visualEndCursor;
    this.deletedLinesIndeces = vimState.deletedLinesIndeces;
    this.commandName = vimState.commandName;
  }

  public static create(cursor: Cursor, lines?: string[], text?: string) {
    return new VimStateClass({ cursor, lines, text });
  }

  public serialize(): VimState {
    return {
      cursor: this.cursor,
      lines: this.lines,
      text: this.text,
      mode: this.mode,
      visualStartCursor: this.visualStartCursor,
      visualEndCursor: this.visualEndCursor,
      deletedLinesIndeces: this.deletedLinesIndeces,
      commandName: this.commandName,
    };
  }

  public getLineAt(lineIndex: number) {
    const line = this.lines[lineIndex];
    return line;
  }

  public getActiveLine() {
    const active = this.getLineAt(this.cursor.line) ?? '';
    // const active = this.getLineAt(this.cursor.line);
    return active;
  }

  public getPreviousLine() {
    const previous = this.getLineAt(this.cursor.line - 1);
    return previous;
  }

  public updateLine(lineIndex: number, updated: string) {
    this.lines[lineIndex] = updated;
    this.text = updated;
  }

  public updateActiveLine(updated: string) {
    this.updateLine(this.cursor.line, updated);
  }
}
