import { cloneDeep } from "lodash";
import { Cursor, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Normal", () => {
  let v: Vim;
  beforeEach(() => {
    v = new Vim(cloneDeep(input), cloneDeep(cursor));
    v.enterNormalMode();
  });

  //
  describe("C: Navigating", () => {
    it("F: Update cursor on move right", () => {
      const result = v.executeCommand<Cursor>("cursorRight");
      expect(result.col).toBe(cursor.col + 1);
    });
    it("F: Update cursor on move left", () => {
      const result = v.executeCommand<Cursor>("cursorLeft");
      expect(result.col).toBe(cursor.col - 1);
    });
    it("F: Update cursor on move up", () => {
      const result = v.executeCommand<Cursor>("cursorUp");
      expect(result.line).toBe(cursor.line - 1);
    });
    it("F: Update cursor on move down", () => {
      const result = v.executeCommand<Cursor>("cursorDown");
      expect(result.line).toBe(cursor.line + 1);
    });
  });
});
