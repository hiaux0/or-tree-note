import { NormalMode } from "modules/vim/modes/normal-mode";
import { cloneDeep } from "lodash";
import { Cursor, Vim, VimCommandOutput } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Normal", () => {
  let vim: Vim;
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    vim.enterNormalTextMode();
  });

  //
  describe("C: Navigating", () => {
    it("F: Update cursor on move right", () => {
      const result = vim.executeCommand<Cursor>("cursorRight");
      expect(result.cursor.col).toBe(cursor.col + 1);
    });
    it("F: Update cursor on move left", () => {
      const customV = new Vim(cloneDeep(input), { col: 2, line: 0 });
      const result = customV.executeCommand<Cursor>("cursorLeft");
      expect(result.cursor.col).toBe(1);
    });
    it("F: Cursor stays in horizontal boundaries - Right", () => {
      const customV = new Vim(cloneDeep(input), { col: 3, line: 0 });
      const result = customV.executeCommand<Cursor>("cursorRight");
      expect(result.cursor.col).toBe(3);
    });
    it("F: Cursor stays in horizontal boundaries - Left", () => {
      const result = vim.executeCommand<Cursor>("cursorLeft");
      expect(result.cursor.col).toBe(0);
    });
    it("F: Update cursor on move up", () => {
      const result = vim.executeCommand<Cursor>("cursorUp");
      expect(result.cursor.line).toBe(cursor.line - 1);
    });
    it("F: Update cursor on move down", () => {
      const result = vim.executeCommand<Cursor>("cursorDown");
      expect(result.cursor.line).toBe(cursor.line + 1);
    });
    //
    const outOfBoundCursorTests: [Cursor, string][] = [
      [
        { col: 9, line: 0 },
        "[ILLEGAL]: Cursor out of bound: Your input has 3 columns, but cursor column is: 9",
      ],
      [
        { col: 0, line: 9 },
        "[ILLEGAL]: Cursor out of bound: Your input has 1 lines, but cursor line is: 9",
      ],
      [
        { col: -9, line: 0 },
        "[ILLEGAL]: Cursor out of bound: Must not be negative, but column is -9",
      ],
      [
        { col: 0, line: -9 },
        "[ILLEGAL]: Cursor out of bound: Must not be negative, but line is -9",
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

    it("F: Throw on out of bound cursor position - Negative", () => {
      try {
        const customV = new Vim(cloneDeep(input), { col: -9, line: 0 });
      } catch (error) {
        expect(error.message).toBe(
          "[ILLEGAL]: Cursor out of bound: Must not be negative, but column is -9"
        );
      }
    });
  });
});

describe("C: Normal Mode", () => {
  let normalMode: NormalMode;

  //
  describe("C: Cursor", () => {
    describe("C: #getTokenUnderCursor", () => {
      it("F: true - 1", () => {
        const vimCommandOut: VimCommandOutput = {
          text: "foo bar",
          cursor: { col: 0, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toEqual({ end: 2, start: 0, string: "foo", index: 0 });
      });
      it("F: true - 2", () => {
        const vimCommandOut: VimCommandOutput = {
          text: "foo bar",
          cursor: { col: 4, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toEqual({ end: 6, start: 4, string: "bar", index: 1 });
      });

      it("F: false", () => {
        const vimCommandOut: VimCommandOutput = {
          text: "foo bar",
          cursor: { col: 3, line: 0 },
        };
        normalMode = new NormalMode(vimCommandOut);
        const result = normalMode.getTokenUnderCursor();
        expect(result).toBeUndefined();
      });
    });
  });

  describe("#cursorWordForwardEnd", () => {
    it("F: e", () => {
      let vimCommandOut: VimCommandOutput = {
        text: "foo bar",
        cursor: { col: 0, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 2, line: 0 }, text: "foo bar" });
    });
    it("F: ee", () => {
      let vimCommandOut: VimCommandOutput = {
        text: "foo bar",
        cursor: { col: 2, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 6, line: 0 }, text: "foo bar" });
    });
    it("F: eee - e at end of line", () => {
      let vimCommandOut: VimCommandOutput = {
        text: "foo bar",
        cursor: { col: 6, line: 0 },
      };
      normalMode = new NormalMode(vimCommandOut);
      const result = normalMode.cursorWordForwardEnd();
      expect(result).toEqual({ cursor: { col: 6, line: 0 }, text: "foo bar" });
    });
  });
});
