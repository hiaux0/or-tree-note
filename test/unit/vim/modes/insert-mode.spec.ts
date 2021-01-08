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
});
