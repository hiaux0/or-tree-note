import { cloneDeep } from "lodash";
import { Cursor, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Insert", () => {
  let vim: Vim;
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
  });

  describe("C: Typing characters", () => {
    it("F: Update input with typed character", () => {
      vim.enterInsertMode();
      const result = vim.executeCommand("type", "!");
      expect(result).toBe(`!${input[0]}`); // !foo
    });
    it("F: Curosr updated after character input", () => {});
  });
});
