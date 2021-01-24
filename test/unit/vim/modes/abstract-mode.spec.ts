import { cloneDeep } from "lodash";
import { tokenizeInput } from "modules/vim/modes/abstract-mode";
import { Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor = { line: 0, col: 0 };

describe("Vim - Abstract Mode", () => {
  let vim: Vim;

  /** *************/
  /** Input Queue */
  /** *************/

  describe("C: Input Queue", () => {
    beforeEach(() => {
      vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    });

    it("F: Should execute command in Input Queue", () => {
      vim.enterInsertTextMode();
      const result = vim.queueInput("@");
      expect(result.vimState.text).toBe(`@${input[0]}`);
    });
    it("F: Should execute command in Input Queue Sequence", () => {
      vim.enterInsertTextMode();
      const result = vim.queueInputSequence("345");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "3foo" },
          targetCommand: "type",
          lines: ["3foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "34foo" },
          targetCommand: "type",
          lines: ["34foo"],
        },
        {
          vimState: { cursor: { col: 3, line: 0 }, text: "345foo" },
          targetCommand: "type",
          lines: ["345foo"],
        },
      ]);
    });
  });

  /** *************/
  /** Tokenizing */
  /** *************/
  describe("C: Tokenizing", () => {
    describe("C: tokenizeInput", () => {
      it("F: Simple tokenize", () => {
        const input = "foo bar";
        const result = tokenizeInput(input);
        expect(result).toEqual([
          { end: 2, start: 0, string: "foo", index: 0 },
          { end: 6, start: 4, string: "bar", index: 1 },
        ]);
      });
    });
  });
});
