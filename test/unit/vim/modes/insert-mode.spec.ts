import { cloneDeep } from "lodash";
import { Vim } from "modules/vim/vim";
import { VimCommandManager } from "modules/vim/vim-command-manager";
import { Cursor } from "modules/vim/vim.types";
import { createVimState } from "../../vim-state-utils";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Insert", () => {
  let vimCommandManager: VimCommandManager;

  beforeEach(() => {
    vimCommandManager = new VimCommandManager(
      cloneDeep(input),
      cloneDeep(createVimState())
    );
  });

  describe("C: Typing characters", () => {
    it("F: Update input with typed character", () => {
      vimCommandManager.enterInsertTextMode();
      const result = vimCommandManager.executeVimCommand("type", "!");
      expect(result.text).toBe(`!${input[0]}`); // !foo
    });
    it("F: Cursor updated after character input", () => {
      vimCommandManager.enterInsertTextMode();
      const result = vimCommandManager.executeVimCommand("type", "!");
      expect(result.cursor).toEqual({ col: 1, line: 0 }); // !foo
    });
  });
});
