import { cloneDeep, map } from "lodash";
import { Cursor, KeyBindingModes, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };
let vim: Vim;

describe("C: Mode - Normal", () => {
  describe("C: Sequenced commands", () => {
    beforeEach(() => {
      vim = new Vim(cloneDeep(input), cloneDeep(cursor));
      vim.enterNormalTextMode();
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
        vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
          keyBindings,
        });
        vim.enterNormalTextMode();
      });
      it("F: Find potential sequenced commands - 1 char - (sideeffect)", () => {
        const result = vim.findPotentialCommand("f");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
          "yank",
        ]);
      });
      it("F: Find potential sequenced commands - 2 chars - (sideeffect)", () => {
        const result = vim.findPotentialCommand("fo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Find potential sequenced commands - 3 chars - (sideeffect)", () => {
        const result = vim.findPotentialCommand("foo");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
        ]);
      });
      it("F: Return sequenced command name", () => {
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
          vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
            keyBindings,
          });
          vim.enterNormalTextMode();
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
          expect(result.vimState.cursor).toEqual({ col: 0, line: 1 });
        });
        //
      });
      //
      describe("#queueInputSequence", () => {
        it("F: Input sequence - 1", () => {
          const result = vim.queueInputSequence("u")[0];
          expect(result.targetCommand).toBe("cursorDown");
        });
        it("F: Input sequence - ll", () => {
          const result = vim.queueInputSequence("ll");

          expect(result).toEqual([
            {
              vimState: { cursor: { col: 1, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              wholeInput: ["foo"],
            },
            {
              vimState: { cursor: { col: 2, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              wholeInput: ["foo"],
            },
          ]);
        });
        it("F: Input sequence - lli!", () => {
          const result = vim.queueInputSequence("lli!");

          expect(result).toEqual([
            {
              vimState: { cursor: { col: 1, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              wholeInput: ["foo"],
            },
            {
              vimState: { cursor: { col: 2, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              wholeInput: ["foo"],
            },
            {
              vimState: null,
              targetCommand: "enterInsertTextMode",
              wholeInput: ["foo"],
            },
            {
              vimState: { cursor: { col: 3, line: 0 }, text: "fo!o" },
              targetCommand: "type",
              wholeInput: ["foo"],
            },
          ]);
        });
      });
    });
  });
});

/** *********************/
/** Normal - Multi line */
/** *********************/
describe("C: Mode - Normal - Multi line", () => {
  const multiLineInput = ["foo", "bar"];

  beforeEach(() => {
    vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
    vim.enterNormalTextMode();
  });

  fit("C: Cursor down", () => {
    const result = vim.queueInput("u");
    expect(result).toEqual({
      vimState: {
        cursor: { col: 0, line: 1 },
        text: "bar",
      },
      targetCommand: "cursorDown",
      wholeInput: ["foo", "bar"],
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
        key: "<Escape>",
        command: "enterNormalTextMode",
      });
    });
    //
    it("F: Modifier key Escape (<esc>)", () => {
      const result = vim.findPotentialCommand("<esc>");
      expect(result.targetCommand).toEqual({
        key: "<Escape>",
        command: "enterNormalTextMode",
      });
    });
  });

  describe("#queueInput", () => {
    it("F: Single Input", () => {
      const result = vim.queueInputSequence("@");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          wholeInput: ["foo"],
        },
      ]);
    });
  });

  describe("#queueInputSequence", () => {
    it("F: Input sequence - string", () => {
      const result = vim.queueInputSequence("@<esc>l");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          wholeInput: ["foo"],
        },
        {
          vimState: null,
          targetCommand: "enterNormalTextMode",
          wholeInput: ["foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@foo" },
          targetCommand: "cursorRight",
          wholeInput: ["foo"],
        },
      ]);
    });
    it("F: Input sequence - string - multiple typing", () => {
      const result = vim.queueInputSequence("@#<esc>l");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          wholeInput: ["foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@#foo" },
          targetCommand: "type",
          wholeInput: ["foo"],
        },
        {
          vimState: null,
          targetCommand: "enterNormalTextMode",
          wholeInput: ["foo"],
        },
        {
          vimState: { cursor: { col: 3, line: 0 }, text: "@#foo" },
          targetCommand: "cursorRight",
          wholeInput: ["foo"],
        },
      ]);
    });

    it("F: Input sequence - string[]", () => {
      const result = vim.queueInputSequence(["@", "<esc>", "l"]);
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          wholeInput: ["foo"],
        },
        {
          vimState: null,
          targetCommand: "enterNormalTextMode",
          wholeInput: ["foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@foo" },
          targetCommand: "cursorRight",
          wholeInput: ["foo"],
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

  describe("#splitInputSequence", () => {
    it("Split mixed input", () => {
      const result = vim.splitInputSequence("1<23>45<67><8>9");
      expect(result).toEqual(["1", "<23>", "4", "5", "<67>", "<8>", "9"]);
    });
    it("Input with `<`", () => {
      const result = vim.splitInputSequence("1<23><");
      expect(result).toEqual(["1", "<23>", "<"]);
    });
    it("Input with `>`", () => {
      const result = vim.splitInputSequence("1><23>");
      expect(result).toEqual(["1", ">", "<23>"]);
    });
  });
});
