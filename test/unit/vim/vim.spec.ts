import { cloneDeep, map } from "lodash";
import { Cursor, KeyBindingModes, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Normal", () => {
  describe("C: Chained commands", () => {
    let vim: Vim;
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
      };
      vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
        keyBindings,
      });
      vim.enterNormalTextMode();
    });

    describe("Finding", () => {
      it("F: Find potential chained commands - 1 char - (sideeffect)", () => {
        const result = vim.findPotentialCommand("f");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
          "yank",
        ]);
      });
      it("F: Find potential chained commands - 2 chars - (sideeffect)", () => {
        const result = vim.findPotentialCommand("fo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Find potential chained commands - 3 chars - (sideeffect)", () => {
        const result = vim.findPotentialCommand("foo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Return chained command name", () => {
        const { targetCommand } = vim.findPotentialCommand("u");
        expect(targetCommand.command).toEqual("cursorDown");
      });
      it("F: Throw error on no match", () => {
        try {
          vim.findPotentialCommand("x");
        } catch (error) {
          expect(error.message).toBe("Empty Array");
        }
      });
    });

    describe("Getting", () => {
      describe("#getCommandName", () => {
        it("F: Get command - Single", () => {
          const result = vim.getCommandName("u");
          expect(result).toBe("cursorDown");
        });
        /**
         * Relates to #findPotentialCommand test
         */
        it("F: Get command - Chain", () => {
          //
          vim.getCommandName("f");
          vim.getCommandName("o");
          const result = vim.getCommandName("o");
          expect(result).toBe("cursorDown");
        });
      });
      //
      describe("#queueChainedInputs", () => {
        it("F: Single input", () => {
          const result = vim.queueInput("u");
          expect(result.targetCommand).toBe("cursorDown");
          expect(result.commandOutput).toEqual({ col: 0, line: 1 });
        });
        //
      });
      //
      describe("#queueChainedInputs", () => {
        it("F: Chained input", () => {
          const result = vim.queueChainedInputs("u");
          expect(result.targetCommand).toBe("cursorDown");
          expect(result.commandOutput).toEqual({ col: 0, line: 1 });
        });
        it("F: Chained input - lli!", () => {
          vim = new Vim(cloneDeep(input), cloneDeep(cursor));
          const result = vim.queueChainedInputs("lli!");
          expect(result.commandOutput).toBe("fo!o");
        });
      });
    });
  });
});

describe("C: Mode - Insert", () => {
  let vim: Vim;

  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    vim.enterInsertTextMode();
  });

  describe("C: #findPotentialCommand", () => {
    it("F: Modifier key Escape", () => {
      const result = vim.queueInput("Escape");
      expect(result.targetCommand).toBe("enterNormalTextMode");
    });
  });
});
