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

  /** *************/
  /** Input Queue */
  /** *************/

  describe("C: Input Queue", () => {
    it("F: Should execute command in Input Queue", () => {
      v.enterInsertMode();
      const result = v.queueInput("@");
      expect(result.commandOutput).toBe(`@${input[0]}`);
    });
    it("F: Should execute command in Input Queue Chain", () => {
      v.enterInsertMode();
      const result = v.queueChainedInputs("345");
      expect(result.commandOutput).toBe(`345${input[0]}`);
    });
  });
});
