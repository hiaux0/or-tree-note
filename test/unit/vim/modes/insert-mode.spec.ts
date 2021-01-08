import { cloneDeep } from "lodash";
import { Cursor, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Insert", () => {
  let v: Vim;
  beforeEach(() => {
    v = new Vim(cloneDeep(input), cloneDeep(cursor));
  });

  describe("C: Typing characters", () => {
    it("F: Update input with typed character", () => {
      v.enterInsertMode();
      const result = v.executeCommand("type", "!");
      expect(result).toBe(`!${input[0]}`); // !foo
    });
    it("F: Curosr updated after character input", () => {});
  });
});
