import { cloneDeep, map } from "lodash";
import { Vim, VimError } from "modules/vim/vim";
import { Cursor, VimPlugin, KeyBindingModes } from "modules/vim/vim.types";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };
let vim: Vim;

describe("C: Mode - Normal", () => {
  describe("C: Sequenced commands", () => {
    beforeEach(() => {
      vim = new Vim(cloneDeep(input), cloneDeep(cursor));
      vim.enterNormalMode();
    });

    describe("Getting", () => {
      //
      describe("#queueInput", () => {
        it("F: Single input", () => {
          const result = vim.queueInput("u");
          expect(result.targetCommand).toBe("cursorDown");
          expect(result.vimState.cursor).toEqual({ col: 0, line: 0 });
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
              lines: ["foo"],
            },
            {
              vimState: { cursor: { col: 2, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              lines: ["foo"],
            },
          ]);
        });
        it("F: Input sequence - lli!", () => {
          const result = vim.queueInputSequence("lli!");

          expect(result).toEqual([
            {
              vimState: { cursor: { col: 1, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              lines: ["foo"],
            },
            {
              vimState: { cursor: { col: 2, line: 0 }, text: "foo" },
              targetCommand: "cursorRight",
              lines: ["foo"],
            },
            {
              vimState: { cursor: { col: 2, line: 0 }, text: "foo" },
              targetCommand: "enterInsertMode",
              lines: ["foo"],
            },
            {
              vimState: { cursor: { col: 3, line: 0 }, text: "fo!o" },
              targetCommand: "type",
              lines: ["fo!o"],
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
  describe("C: Cursor down", () => {
    it("F: Cursor down", () => {
      const cursor: Cursor = { line: 1, col: 0 };
      const multiLineInput = ["foo", "bar"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("u");
      expect(result).toEqual({
        vimState: {
          cursor: { col: 0, line: 1 },
          text: "bar",
        },
        targetCommand: "cursorDown",
        lines: ["foo", "bar"],
      });
    });
    it("F: Cursor down - last line", () => {
      const cursor: Cursor = { line: 1, col: 0 };
      const multiLineInput = ["foo", "bar"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("u");
      expect(result).toEqual({
        vimState: {
          cursor: { col: 0, line: 1 },
          text: "bar",
        },
        targetCommand: "cursorDown",
        lines: ["foo", "bar"],
      });
    });
    it("F: uee", () => {
      const cursor: Cursor = { line: 1, col: 0 };
      const multiLineInput = ["hi", "012 456"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));

      const result = vim.queueInputSequence("uee");
      expect(result).toEqual([
        {
          targetCommand: "cursorDown",
          vimState: { cursor: { col: 0, line: 1 }, text: multiLineInput[1] },
          lines: multiLineInput,
        },
        {
          targetCommand: "cursorWordForwardEnd",
          vimState: { cursor: { col: 2, line: 1 }, text: multiLineInput[1] },
          lines: multiLineInput,
        },
        {
          targetCommand: "cursorWordForwardEnd",
          vimState: { cursor: { col: 6, line: 1 }, text: multiLineInput[1] },
          lines: multiLineInput,
        },
      ]);
    });
    it("F: ueek - Upper line shorter lower line", () => {
      const cursor: Cursor = { col: 6, line: 1 };
      const multiLineInput = ["hi", "012 456"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("k");
      expect(result).toEqual({
        targetCommand: "cursorUp",
        vimState: { cursor: { col: 1, line: 0 }, text: multiLineInput[0] },
        lines: multiLineInput,
      });
    });
  });
  describe("C: Cursor up", () => {
    it("F: Cursor up", () => {
      const cursor: Cursor = { line: 1, col: 0 };
      const multiLineInput = ["foo", "bar"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("k");
      expect(result).toEqual({
        vimState: {
          cursor: { col: 0, line: 0 },
          text: "foo",
        },
        targetCommand: "cursorUp",
        lines: ["foo", "bar"],
      });
    });
    it("F: Cursor up - first line", () => {
      const cursor: Cursor = { line: 1, col: 0 };
      const multiLineInput = ["foo", "bar"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("k");
      expect(result).toEqual({
        vimState: {
          cursor: { col: 0, line: 0 },
          text: "foo",
        },
        targetCommand: "cursorUp",
        lines: ["foo", "bar"],
      });
    });

    it("F: eeu - Upper line longer lower line", () => {
      const cursor: Cursor = { col: 6, line: 0 };
      const multiLineInput = ["012 456", "hi"];
      vim = new Vim(cloneDeep(multiLineInput), cloneDeep(cursor));
      vim.enterNormalMode();

      const result = vim.queueInput("u");
      expect(result).toEqual({
        targetCommand: "cursorDown",
        vimState: { cursor: { col: 1, line: 1 }, text: multiLineInput[1] },
        lines: multiLineInput,
      });
    });
  });
});

/** ***********/
/** Methods   */
/** ***********/

describe("Methods", () => {
  beforeEach(() => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));
  });

  describe("#queueInput", () => {
    it("F: Single Input", () => {
      vim.enterInsertMode();
      const result = vim.queueInputSequence("@");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          lines: ["@foo"],
        },
      ]);
    });
  });

  describe("#queueInputSequence", () => {
    it("F: Input sequence - string", () => {
      vim.enterInsertMode();
      const result = vim.queueInputSequence("@<esc>l");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          lines: ["@foo"],
        },
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "enterNormalMode",
          lines: ["@foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@foo" },
          targetCommand: "cursorRight",
          lines: ["@foo"],
        },
      ]);
    });
    it("F: Input sequence - string - multiple typing", () => {
      vim.enterInsertMode();
      const result = vim.queueInputSequence("@#<esc>l");
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          lines: ["@foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@#foo" },
          targetCommand: "type",
          lines: ["@#foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@#foo" },
          targetCommand: "enterNormalMode",
          lines: ["@#foo"],
        },
        {
          vimState: { cursor: { col: 3, line: 0 }, text: "@#foo" },
          targetCommand: "cursorRight",
          lines: ["@#foo"],
        },
      ]);
    });

    it("F: Input sequence - string[]", () => {
      vim.enterInsertMode();
      const result = vim.queueInputSequence(["@", "<esc>", "l"]);
      expect(result).toEqual([
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "type",
          lines: ["@foo"],
        },
        {
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          targetCommand: "enterNormalMode",
          lines: ["@foo"],
        },
        {
          vimState: { cursor: { col: 2, line: 0 }, text: "@foo" },
          targetCommand: "cursorRight",
          lines: ["@foo"],
        },
      ]);
    });

    //
    const input = "i@#<esc>e";
    it(`Sequence: ${input}`, () => {
      const result = vim.queueInputSequence(input);
      expect(result).toEqual([
        {
          targetCommand: "enterInsertMode",
          vimState: { cursor: { col: 0, line: 0 }, text: "foo" },
          lines: ["foo"],
        },
        {
          targetCommand: "type",
          vimState: { cursor: { col: 1, line: 0 }, text: "@foo" },
          lines: ["@foo"],
        },
        {
          targetCommand: "type",
          vimState: { cursor: { col: 2, line: 0 }, text: "@#foo" },
          lines: ["@#foo"],
        },
        {
          targetCommand: "enterNormalMode",
          vimState: { cursor: { col: 2, line: 0 }, text: "@#foo" },
          lines: ["@#foo"],
        },
        {
          targetCommand: "cursorWordForwardEnd",
          vimState: { cursor: { col: 4, line: 0 }, text: "@#foo" },
          lines: ["@#foo"],
        },
      ]);
    });
  });
});

/** ************/
/** Vim Plugin */
/** ************/

describe("C: Vim Plugin", () => {
  it("F: Execute plugin", () => {
    const plugin: VimPlugin = {
      commandName: "toggleCheckbox",
      execute: () => {},
    };
    vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
      vimPlugins: [plugin],
    });
    spyOn(plugin, "execute");
    const result = vim.queueInput("<Space>tc");
    expect(result.targetCommand).toBe("toggleCheckbox");
    expect(plugin.execute).toHaveBeenCalled();
  });
  it("F: Execute plugin - modify vimState", () => {
    const plugin: VimPlugin = {
      commandName: "toggleCheckbox",
      execute: (vimState, commandInput) => {
        vimState.text = commandInput;
        return vimState;
      },
    };
    vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
      vimPlugins: [plugin],
    });
    //
    const inputValue = "<Space>tc";
    const result = vim.queueInput(inputValue);
    expect(result.vimState.text).toBe(inputValue); // Because in the test we set the `text` to be the command
  });
});
