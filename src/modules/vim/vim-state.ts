import {
  Cursor,
  EMPTY_VIM_LINE,
  FoldMap,
  VimLine,
  VimMode,
  VimStateV2,
} from './vim-types';

export class VimStateClass {
  cursor: Cursor;
  foldMap: FoldMap;
  lines: VimLine[];
  mode: VimMode;
  visualStartCursor: Cursor;
  visualEndCursor: Cursor;
  deletedLinesIndeces: number[];
  commandName: string;

  constructor(public vimState: VimStateV2) {
    this.cursor = vimState.cursor;
    this.foldMap = vimState.foldMap;
    this.lines = vimState.lines;
    this.mode = vimState.mode ?? VimMode.NORMAL;
    this.visualStartCursor = vimState.visualStartCursor;
    this.visualEndCursor = vimState.visualEndCursor;
    this.deletedLinesIndeces = vimState.deletedLinesIndeces;
    this.commandName = vimState.commandName;
  }

  public static create(cursor: Cursor, lines?: VimLine[]) {
    return new VimStateClass({ cursor, lines });
  }

  public serialize(): VimStateV2 {
    return {
      cursor: this.cursor,
      foldMap: this.foldMap,
      lines: this.lines,
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
    const active = this.getLineAt(this.cursor.line) ?? EMPTY_VIM_LINE;
    // const active = this.getLineAt(this.cursor.line);
    return active;
  }

  public getPreviousLine() {
    const previous = this.getLineAt(this.cursor.line - 1);
    return previous;
  }

  public updateLine(lineIndex: number, updated: string) {
    this.lines[lineIndex] = { text: updated };
  }

  public updateActiveLine(updated: string) {
    this.updateLine(this.cursor.line, updated);
  }
}
