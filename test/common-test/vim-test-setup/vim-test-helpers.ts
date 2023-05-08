import { Cursor } from '../../../src/modules/vim/vim-types';
import { testError } from '../errors/test-errors';

export function replaceCursorFromRaw(rawInput: string[]) {
  const result = rawInput.map((line) => {
    const isCursorMatch = matchCursor(line);
    if (isCursorMatch) {
      const [cursorChar] = isCursorMatch;
      return line.replace(cursorChar, '');
    }

    return line;
  });
  return result;
}

/**
 * @example
 * |foo or \|foo
 */
export function matchCursor(line: string) {
  const cursorPositionRegExp = /(\\\|)|(\|)/g;
  const matchedCursor = cursorPositionRegExp.exec(line);
  return matchedCursor;
}

/**
 * @example
 * const input = `
 * foo
 * b|ar
 * `
 * findCursor(input) // {col: 1, line: 1}
 *
 */
export function findCursor(input: string[]): Cursor {
  let cursorLine: number | undefined;
  let cursorColumn: number | undefined;
  input.forEach((line, index) => {
    const matchedCursor = matchCursor(line);
    if (matchedCursor === null) return;
    if (cursorLine !== undefined && cursorColumn !== undefined) {
      /* prettier-ignore */ logAlreadyFoundCursorError(cursorLine, cursorColumn, index, matchedCursor);
    }

    /* prettier-ignore */
    if (matchedCursor[0][1] === '|') { // \|
      cursorColumn = matchedCursor.index - 1; // - 1 for \
    } else {
      cursorColumn = matchedCursor.index;
    }

    cursorLine = index;
  });

  return {
    col: cursorColumn,
    line: cursorLine,
  };
}

function logAlreadyFoundCursorError(
  cursorLine: number,
  cursorColumn: number,
  index: number,
  matchedCursor: RegExpExecArray
) {
  testError.log('Found more than one cursor. Should only have one.');
  testError.log(
    `First cursor at: Line: ${cursorLine} - Column: ${cursorColumn}`
  );
  testError.log(
    `Second cursor at: Line: ${index} - Column: ${matchedCursor.index}`
  );
}
