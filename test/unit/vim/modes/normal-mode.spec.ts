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
});
