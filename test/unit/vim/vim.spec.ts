import { cloneDeep } from "lodash";
import { sendKeyEvent } from "modules/keys/keys";
import { Cursor, Vim, VimMode } from "modules/vim/vim";

const input = ["foo"];
const cursor = { line: 0, col: 0 };

describe("Vim", () => {
  let v: Vim;
  beforeEach(() => {
    v = new Vim(cloneDeep(input), cloneDeep(cursor));
  });

  /** *******/
  /** Modes */
  /** *******/

  describe("C: Modes", () => {
    it("F: Switch to insert mode", () => {
      v.enterInsertMode();
      expect(v.vimMode).toBe(VimMode.INSERT);
    });
    it("F: Switch to insert mode", () => {
      v.enterNormalMode();
      expect(v.vimMode).toBe(VimMode.NORMAL);
    });
  });
  describe("C: Mode - Normal", () => {
    beforeEach(() => {
      v.enterNormalMode();
    });

    describe("C: Navigating", () => {
      it("F: Update cursor on move right", () => {
        const result = v.executeCommand<Cursor>("cursorRight");
        expect(result.col).toBe(cursor.col + 1);
      });
    });
  });
  describe("C: Mode - Insert", () => {
    describe("C: Typing characters", () => {
      it("F: Update input with typed character", () => {
        v.enterInsertMode();
        const result = v.executeCommand("type", "!");
        expect(result).toBe(`!${input[0]}`); // !foo
      });
      it("F: Curosr updated after character input", () => {});
    });
  });

  /** *************/
  /** Input Queue */
  /** *************/
  describe("C: Input Queue", () => {
    it("F: Should execute command in Input Queue", () => {
      v.enterInsertMode();
      const result = v.queueInput("@");
      expect(result).toBe(`@${input[0]}`);
    });
    it("F: Should execute command in Input Queue Chain", () => {
      v.enterInsertMode();
      const result = v.queueChainedInputs("345");
      expect(result).toBe(`345${input[0]}`);
    });
  });
});
