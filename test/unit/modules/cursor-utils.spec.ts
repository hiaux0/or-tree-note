import { CursorUtils } from '../../../src/modules/cursor/cursor-utils';
import { Cursor } from '../../../src/modules/vim/vim-types';

describe('CursorUtils', () => {
  describe.only('isWithinLines', () => {
    const startCursor: Cursor = {
      col: 1,
      line: 1,
    };
    const endCursor: Cursor = {
      col: 3,
      line: 3,
    };

    const cursorCases: [Cursor, boolean][] = [
      [{ col: 0, line: 0 }, false],
      [{ col: 0, line: 1 }, true],
      [{ col: 0, line: 2 }, true],
      [{ col: 0, line: 3 }, true],
      [{ col: 0, line: 4 }, false],
    ];

    cursorCases.forEach(([target, expected]) => {
      const { col, line } = target;
      it(`Col: ${col} - Line: ${line}`, () => {
        const result = CursorUtils.isWithinLines(
          startCursor,
          endCursor,
          target
        );

        expect(result).toBe(expected);
      });
    });
  });

  describe('isWithinRange', () => {
    const startCursor: Cursor = {
      col: 1,
      line: 1,
    };
    const endCursor: Cursor = {
      col: 5,
      line: 5,
    };

    const cursorCases: [Cursor, boolean][] = [
      [{ col: 0, line: 0 }, false],
      [{ col: 0, line: 1 }, false],
      [{ col: 1, line: 1 }, true],
      [{ col: 3, line: 1 }, true],
      [{ col: 1, line: 3 }, true],
      [{ col: 3, line: 3 }, true],
      [{ col: 5, line: 3 }, true],
      [{ col: 3, line: 5 }, true],
      [{ col: 5, line: 5 }, true],
      [{ col: 6, line: 5 }, false],
      [{ col: 6, line: 6 }, false],
    ];

    cursorCases.forEach(([target, expected]) => {
      const { col, line } = target;
      it(`Col: ${col} - Line: ${line}`, () => {
        const result = CursorUtils.isWithinRange(
          startCursor,
          endCursor,
          target
        );

        expect(result).toBe(expected);
      });
    });
  });
});
