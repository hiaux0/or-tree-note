import { Logger } from 'common/logging/logging';
import { ISnippet } from 'resources/keybindings/snippets/snippets';
import { EditorId } from 'store/initial-state';

import { VimCommandNames } from './vim-commands-repository';
import {
  Cursor,
  EMPTY_VIM_LINE,
  FoldMap,
  VimLine,
  VimMode,
  VimStateV2,
} from './vim-types';

const logger = new Logger('VimState');

export class VimStateClass {
  id: EditorId;
  cursor: Cursor;
  foldMap: FoldMap;
  lines: VimLine[];
  mode: VimMode;
  visualStartCursor: Cursor;
  visualEndCursor: Cursor;
  deletedLinesIndeces: number[];
  commandName: VimCommandNames;
  snippet: ISnippet;

  constructor(private readonly vimState: VimStateV2) {
    this.updateVimState(vimState);
  }

  public static create(cursor: Cursor, lines?: VimLine[]) {
    return new VimStateClass({ cursor, lines });
  }

  public serialize(): VimStateV2 {
    return {
      id: this.id,
      cursor: this.cursor,
      foldMap: this.foldMap,
      lines: this.lines,
      mode: this.mode,
      visualStartCursor: this.visualStartCursor,
      visualEndCursor: this.visualEndCursor,
      deletedLinesIndeces: this.deletedLinesIndeces,
      commandName: this.commandName,
      snippet: this.snippet,
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
    const lineIndex = Math.max(this.cursor.line - 1, 0);
    const previous = this.getLineAt(lineIndex);
    return previous;
  }

  public updateLine(lineIndex: number, updated: string) {
    this.lines[lineIndex] = { text: updated };
  }

  public updateActiveLine(updated: string) {
    this.updateLine(this.cursor.line, updated);
  }

  public updateCursor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public updateVimState(vimState: VimStateV2) {
    this.id = vimState.id;
    this.cursor = vimState.cursor;
    this.foldMap = vimState.foldMap;
    this.lines = vimState.lines;
    this.mode = vimState.mode ?? VimMode.NORMAL;
    this.visualStartCursor = vimState.visualStartCursor;
    this.visualEndCursor = vimState.visualEndCursor;
    this.deletedLinesIndeces = vimState.deletedLinesIndeces;
    this.commandName = vimState.commandName;
    this.snippet = vimState.snippet;
  }

  public reportVimState() {
    const { cursor, lines, mode } = this;
    logger.culogger.overwriteDefaultLogOtpions({ log: true });
    /* prettier-ignore */ if (mode) logger.culogger.debug(['Vim in Mode:', mode], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Cursor at', {...cursor}], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Lines are', lines.map(l => l.text)], {}, (...r) => console.log(...r));
    logger.culogger.overwriteDefaultLogOtpions({ log: false });
  }

  public isInsertMode(): boolean {
    const is = this.mode === VimMode.INSERT;
    return is;
  }
}
