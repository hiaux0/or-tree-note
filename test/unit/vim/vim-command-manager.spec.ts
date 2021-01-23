import { VimCommandManager } from "modules/vim/vim-command-manager";
import { cloneDeep, map } from "lodash";
import {
  Cursor,
  KeyBindingModes,
  VimMode,
  VimState,
} from "modules/vim/vim.types";
import { createVimState } from "../vim-state-utils";

const input = ["foo"];
const cursor = { line: 0, col: 0 };

describe("Vim - General", () => {
  let vimCommandManager: VimCommandManager;

  beforeEach(() => {
    vimCommandManager = new VimCommandManager(
      cloneDeep(input),
      cloneDeep(createVimState())
    );
  });

  /** *******/
  /** Modes */
  /** *******/

  describe("C: Modes", () => {
    it("F: Switch to insert mode", () => {
      vimCommandManager.enterInsertTextMode();
      expect(vimCommandManager.activeMode).toBe(VimMode.INSERT);
    });
    it("F: Switch to insert mode", () => {
      vimCommandManager.enterNormalTextMode();
      expect(vimCommandManager.activeMode).toBe(VimMode.NORMAL);
    });
  });

  describe("C: Navigating", () => {
    it("F: Update cursor on move right", () => {
      const result = vimCommandManager.executeVimCommand<Cursor>("cursorRight");
      expect(result.cursor.col).toBe(cursor.col + 1);
    });
    it("F: Update cursor on move left", () => {
      const customV = new VimCommandManager(
        cloneDeep(input),
        createVimState({
          col: 2,
          line: 0,
        })
      );
      const result = customV.executeVimCommand<Cursor>("cursorLeft");
      expect(result.cursor.col).toBe(1);
    });
    it("F: Cursor stays in horizontal boundaries - Right", () => {
      const customV = new VimCommandManager(
        cloneDeep(input),
        createVimState({
          col: 3,
          line: 0,
        })
      );
      const result = customV.executeVimCommand<Cursor>("cursorRight");
      expect(result.cursor.col).toBe(3);
    });
    it("F: Cursor stays in horizontal boundaries - Left", () => {
      const result = vimCommandManager.executeVimCommand<Cursor>("cursorLeft");
      expect(result.cursor.col).toBe(0);
    });
  });
});

describe("C: Mode - Normal", () => {
  describe("C: Sequenced commands", () => {
    let vimCommandManager;

    beforeEach(() => {
      vimCommandManager = new VimCommandManager(
        cloneDeep(input),
        cloneDeep(createVimState())
      );
      vimCommandManager.enterNormalTextMode();
    });

    describe("Finding", () => {
      beforeEach(() => {
        const keyBindings: KeyBindingModes = {
          normal: [
            {
              key: "foo",
              command: "cursorDown",
            },
            {
              key: "far",
              command: "yank",
            },
            {
              key: "u",
              command: "cursorDown",
            },
          ],
          insert: [],
          synonyms: {},
        };
        vimCommandManager = new VimCommandManager(
          cloneDeep(input),
          cloneDeep(createVimState()),
          {
            keyBindings,
          }
        );
        vimCommandManager.enterNormalTextMode();
      });
      it("F: Find potential sequenced commands - 1 char - (sideeffect)", () => {
        const result = vimCommandManager.findPotentialCommand("f");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
          "yank",
        ]);
      });
      it("F: Find potential sequenced commands - 2 chars - (sideeffect)", () => {
        const result = vimCommandManager.findPotentialCommand("fo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Find potential sequenced commands - 3 chars - (sideeffect)", () => {
        const result = vimCommandManager.findPotentialCommand("foo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Return sequenced command name", () => {
        const { targetCommand } = vimCommandManager.findPotentialCommand("u");
        expect(targetCommand.command).toEqual("cursorDown");
      });
      it("F: Throw error on no match", () => {
        try {
          vimCommandManager.findPotentialCommand("x");
        } catch (error) {
          expect(error.message).toBe("Empty Array");
        }
      });
    });

    describe("Getting", () => {
      describe("#getCommandName", () => {
        it("F: Get command - Single", () => {
          const result = vimCommandManager.getCommandName("u");
          expect(result).toBe("cursorDown");
        });
        /**
         * Relates to #findPotentialCommand test
         */
        it("F: Get command - Sequence", () => {
          const keyBindings: KeyBindingModes = {
            normal: [
              {
                key: "foo",
                command: "cursorDown",
              },
              {
                key: "far",
                command: "yank",
              },
              {
                key: "u",
                command: "cursorDown",
              },
            ],
            insert: [],
            synonyms: {},
          };
          vimCommandManager = new VimCommandManager(
            cloneDeep(input),
            cloneDeep(createVimState()),
            {
              keyBindings,
            }
          );
          vimCommandManager.enterNormalTextMode();
          //
          vimCommandManager.getCommandName("f");
          vimCommandManager.getCommandName("o");
          const result = vimCommandManager.getCommandName("o");
          expect(result).toBe("cursorDown");
        });
      });
      //
    });
  });
});

describe("Methods", () => {
  let vimCommandManager: VimCommandManager;

  beforeEach(() => {
    vimCommandManager = new VimCommandManager(
      cloneDeep(input),
      cloneDeep(createVimState())
    );
    vimCommandManager.enterInsertTextMode();
  });

  describe("#splitInputSequence", () => {
    it("Split mixed input", () => {
      const result = vimCommandManager.splitInputSequence("1<23>45<67><8>9");
      expect(result).toEqual(["1", "<23>", "4", "5", "<67>", "<8>", "9"]);
    });
    it("Input with `<`", () => {
      const result = vimCommandManager.splitInputSequence("1<23><");
      expect(result).toEqual(["1", "<23>", "<"]);
    });
    it("Input with `>`", () => {
      const result = vimCommandManager.splitInputSequence("1><23>");
      expect(result).toEqual(["1", ">", "<23>"]);
    });
  });

  describe("C: #findPotentialCommand", () => {
    it("F: Modifier key Escape", () => {
      const result = vimCommandManager.findPotentialCommand("Escape");
      expect(result.targetCommand).toEqual({
        key: "<Escape>",
        command: "enterNormalTextMode",
      });
    });
    //
    it("F: Modifier key Escape (<esc>)", () => {
      const result = vimCommandManager.findPotentialCommand("<esc>");
      expect(result.targetCommand).toEqual({
        key: "<Escape>",
        command: "enterNormalTextMode",
      });
    });
  });
});
