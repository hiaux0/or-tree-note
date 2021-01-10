import { cloneDeep, map } from "lodash";
import { Cursor, KeyBindingModes, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };
let vim: Vim;

describe("C: Mode - Normal", () => {
  describe("C: Chained commands", () => {
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
      describe("#queueInput", () => {
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
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    vim.enterInsertTextMode();
  });

  describe("C: #findPotentialCommand", () => {
    it("F: Modifier key Escape", () => {
      const result = vim.findPotentialCommand("Escape");
      expect(result.targetCommand).toEqual({
        key: "Escape",
        command: "enterNormalTextMode",
      });
    });
    //
    it("F: Modifier key Escape (<esc>)", () => {
      const result = vim.findPotentialCommand("<esc>");
      expect(result.targetCommand).toEqual({
        key: "Escape",
        command: "enterNormalTextMode",
      });
    });
  });

  fdescribe("#queueChainedInputs", () => {
    it("F: Chained input - string", () => {
      const result = vim.queueChainedInputs("@<esc>l");
      expect(result).toEqual([
        { commandOutput: "@foo", targetCommand: "type" },
        {
          commandOutput: { line: 0, col: 2 },
          targetCommand: "cursorRight",
        },
      ]);
    });
    it("F: Chained input - string - multiple typing", () => {
      const result = vim.queueChainedInputs("@#<esc>l");
      expect(result).toEqual([
        { commandOutput: "@#foo", targetCommand: "type" },
        {
          commandOutput: { line: 0, col: 3 },
          targetCommand: "cursorRight",
        },
      ]);
    });

    it("F: Chained input - string[]", () => {
      const result = vim.queueChainedInputs(["@", "<esc>", "l"]);
      expect(result).toEqual([
        { commandOutput: "@foo", targetCommand: "type" },
        {
          commandOutput: { line: 0, col: 2 },
          targetCommand: "cursorRight",
        },
      ]);
    });
  });
});

describe("Methods", () => {
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
    vim.enterInsertTextMode();
  });

  describe("#splitInputChain", () => {
    it("Split mixed input", () => {
      const result = vim.splitInputChain("1<23>45<67><8>9");
      expect(result).toEqual(["1", "<23>", "4", "5", "<67>", "<8>", "9"]);
    });
    it("Input with `<`", () => {
      const result = vim.splitInputChain("1<23><");
      expect(result).toEqual(["1", "<23>", "<"]);
    });
    it("Input with `>`", () => {
      const result = vim.splitInputChain("1><23>");
      expect(result).toEqual(["1", ">", "<23>"]);
    });
  });
});
