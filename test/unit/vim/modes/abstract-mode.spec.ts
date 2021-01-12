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
      expect(result.commandOutput.text).toBe(`@${input[0]}`);
    });
    it("F: Should execute command in Input Queue Sequence", () => {
      vim.enterInsertTextMode();
      const result = vim.queueInputSequence("345");
      expect(result).toEqual([
        {
          commandOutput: { cursor: { col: 1, line: 0 }, text: "3foo" },
          targetCommand: "type",
        },
        {
          commandOutput: { cursor: { col: 2, line: 0 }, text: "34foo" },
          targetCommand: "type",
        },
        {
          commandOutput: { cursor: { col: 3, line: 0 }, text: "345foo" },
          targetCommand: "type",
        },
      ]);
    });
  });
});
