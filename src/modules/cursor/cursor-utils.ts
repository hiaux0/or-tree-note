import { Cursor } from 'modules/vim/vim-types';

export class CursorUtils {
  static isWithinLines(
    startCursor: Cursor,
    endCursor: Cursor,
    target: Cursor
  ): boolean {
    if (!startCursor) return false;
    if (!endCursor) return false;
    if (!target) return false;

    const smaller = Math.min(startCursor.line, endCursor.line);
    const bigger = Math.max(startCursor.line, endCursor.line);

    const beforeStartLine = smaller > target.line;
    const afterEndLine = target.line > bigger;
    const withinLines = !beforeStartLine && !afterEndLine;
    return withinLines;
  }

  static isWithinRange(
    startCursor: Cursor,
    endCursor: Cursor,
    target: Cursor
  ): boolean {
    if (!startCursor) return false;
    if (!endCursor) return false;
    if (!target) return false;

    const beforeStartLine = startCursor.line > target.line;
    if (beforeStartLine) return false;

    const beforeStartCol = startCursor.col > target.col;
    const beforeStart = !beforeStartLine && beforeStartCol;
    if (beforeStart) return false;

    const afterEndLine = target.line > endCursor.line;
    if (afterEndLine) return false;

    const afterEndCol = target.col > endCursor.col;
    const notAfterEnd = !afterEndLine && afterEndCol;
    if (notAfterEnd) return false;

    return true;
  }
}
