import { cloneDeep } from "lodash";
import { sendKeyEvent } from "modules/keys/keys";
import { Cursor, Vim, VimMode } from "modules/vim/vim";

const input = ["foo"];
const cursor = { line: 0, col: 0 };

describe("Vim", () => {
  let vim: Vim;
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
  });

  /** *******/
  /** Modes */
  /** *******/

  describe("C: Modes", () => {
    it("F: Switch to insert mode", () => {
      vim.enterInsertTextMode();
      expect(vim.activeMode).toBe(VimMode.INSERT);
    });
    it("F: Switch to insert mode", () => {
      vim.enterNormalTextMode();
      expect(vim.activeMode).toBe(VimMode.NORMAL);
    });
  });

  /** *************/
  /** Input Queue */
  /** *************/

  describe("C: Input Queue", () => {
    it("F: Should execute command in Input Queue", () => {
      vim.enterInsertTextMode();
      const result = vim.queueInput("@");
      expect(result.commandOutput).toBe(`@${input[0]}`);
    });
    it("F: Should execute command in Input Queue Sequence", () => {
      vim.enterInsertTextMode();
      const result = vim.queueInputSequence("345")[0];
      expect(result.commandOutput).toBe(`345${input[0]}`);
    });
  });
});
