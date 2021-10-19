import { cloneDeep } from 'lodash';
import { NormalMode } from 'modules/vim/modes/normal-mode';
import { Vim } from 'modules/vim/vim';
import { Cursor, VimState } from 'modules/vim/vim.types';

const input = ['foo'];
const cursor: Cursor = { line: 0, col: 0 };

describe('C: Mode - Normal', () => {
  let vim: Vim;
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    vim.enterNormalMode();
  });

  //
  describe('C: Navigating', () => {
    const outOfBoundCursorTests: [Cursor, string][] = [
      [
        { col: 9, line: 0 },
        '[ILLEGAL]: Cursor out of bound: Your input has 3 columns, but cursor column is: 9',
      ],
      [
        { col: 0, line: 9 },
        '[ILLEGAL]: Cursor out of bound: Your input has 1 lines, but cursor line is: 9',
      ],
      [
        { col: -9, line: 0 },
        '[ILLEGAL]: Cursor out of bound: Must not be negative, but column is -9',
      ],
      [
        { col: 0, line: -9 },
        '[ILLEGAL]: Cursor out of bound: Must not be negative, but line is -9',
      ],
    ];
    outOfBoundCursorTests.forEach((oobTest, index) => {
      it(`F: Cursor - Out of bound - ${index}`, () => {
        try {
          const customV = new Vim(cloneDeep(input), oobTest[0]);
        } catch (error) {
          expect(error.message).toBe(oobTest[1]);
        }
      });
    });

    it('F: Throw on out of bound cursor position - Negative', () => {
      try {
        const customV = new Vim(cloneDeep(input), { col: -9, line: 0 });
      } catch (error) {
        expect(error.message).toBe(
          '[ILLEGAL]: Cursor out of bound: Must not be negative, but column is -9'
        );
      }
    });
  });
});

describe('C: Normal Mode', () => {
  let normalMode: NormalMode;

  //
  describe('C: Cursor', () => {
    describe('C: #getTokenUnderCursor', () => {
      it('F: true - 1', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 0, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toEqual({ end: 2, start: 0, string: 'foo', index: 0 });
      });
      it('F: true - 2', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 4, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toEqual({ end: 6, start: 4, string: 'bar', index: 1 });
      });

      it('F: false', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 3, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toBeUndefined();
      });
    });
    describe('C: #getNexToken', () => {
      it('F: Get next when at start', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 0, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getNexToken();
        expect(result).toEqual({ end: 2, index: 0, start: 0, string: 'foo' });
      });
    });
    describe('C: #getNexToken', () => {
      it('F: Get next when on word', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 2, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getNexToken();
        expect(result).toEqual({ end: 6, index: 1, start: 4, string: 'bar' });
      });
      it('F: Get next when space', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 3, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getNexToken();
        expect(result).toEqual({ end: 6, index: 1, start: 4, string: 'bar' });
      });
      it('F: Get next when at end', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 6, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getNexToken();
        expect(result).toEqual({ end: 6, index: 1, start: 4, string: 'bar' });
      });
    });
    describe('C: #getPreviousToken', () => {
      it('F: Get previous when on word', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 2, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getPreviousToken();
        expect(result).toEqual({ end: 2, index: 0, start: 0, string: 'foo' });
      });
      it('F: Get previous when space', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 3, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getPreviousToken();
        expect(result).toEqual({ end: 2, index: 0, start: 0, string: 'foo' });
      });
      it('F: Get previous when at end', () => {
        const vimCommandOut: VimState = {
          text: 'foo bar',
          cursor: { col: 6, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.getPreviousToken();
        expect(result).toEqual({ end: 2, index: 0, start: 0, string: 'foo' });
      });
    });
    describe('#cursorBackwordsStartWord', () => {
      it('F: b', () => {
        const vimCommandOut: VimState = {
          text: '012 456',
          cursor: { col: 6, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.cursorBackwordsStartWord();
        expect(result).toEqual({
          cursor: { col: 4, line: 0 },
          text: '012 456',
        });
      });
      it('F: b - in between words', () => {
        const vimCommandOut: VimState = {
          text: '012 456',
          cursor: { col: 3, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.cursorBackwordsStartWord();
        expect(result).toEqual({
          cursor: { col: 0, line: 0 },
          text: '012 456',
        });
      });
      it('F: bb', () => {
        const vimCommandOut: VimState = {
          text: '012 456',
          cursor: { col: 4, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.cursorBackwordsStartWord();
        expect(result).toEqual({
          cursor: { col: 0, line: 0 },
          text: '012 456',
        });
      });
      it('F: bbb - b at end of line', () => {
        const vimCommandOut: VimState = {
          text: '012 456',
          cursor: { col: 0, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut, input);
        const result = normalMode.cursorBackwordsStartWord();
        expect(result).toEqual({
          cursor: { col: 0, line: 0 },
          text: '012 456',
        });
      });
    });
  });

  describe('#cursorWordForwardEnd', () => {
    it('F: e', () => {
      const vimCommandOut: VimState = {
        text: 'foo bar',
        cursor: { col: 0, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut, input);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 2, line: 0 }, text: 'foo bar' });
    });
    it('F: e - in between words', () => {
      const vimCommandOut: VimState = {
        text: 'foo bar',
        cursor: { col: 3, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut, input);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 6, line: 0 }, text: 'foo bar' });
    });
    it('F: ee', () => {
      const vimCommandOut: VimState = {
        text: 'foo bar',
        cursor: { col: 2, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut, input);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 6, line: 0 }, text: 'foo bar' });
    });
    it('F: eee - e at end of line', () => {
      const vimCommandOut: VimState = {
        text: 'foo bar',
        cursor: { col: 6, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut, input);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 6, line: 0 }, text: 'foo bar' });
    });
  });
});

describe('[Normal Mode] Bug hunting', () => {
  it('C: Move up to empty line', () => {
    const lines = ['012 456', '', 'Hello'];
    const vimState = {
      cursor: { line: 2, col: 4 },
      text: 'Hello',
    };

    const nm = new NormalMode(vimState, lines);
    const result = nm.executeCommand('cursorUp');
    expect(result).toEqual({ cursor: { col: 0, line: 1 }, text: '' });
  });
  it('C: Move down to empty line', () => {
    const lines = ['012 456', '', 'Hello'];
    const vimState = {
      cursor: { line: 0, col: 4 },
      text: 'Hello',
    };

    const nm = new NormalMode(vimState, lines);
    const result = nm.executeCommand('cursorDown');
    expect(result).toEqual({ cursor: { col: 0, line: 1 }, text: '' });
  });
});
