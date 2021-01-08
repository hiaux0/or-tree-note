import { cloneDeep, map } from "lodash";
import { Cursor, KeyBindingModes, Vim } from "modules/vim/vim";

const input = ["foo"];
const cursor: Cursor = { line: 0, col: 0 };

describe("C: Mode - Normal", () => {
  describe("C: Chained commands", () => {
    let v: Vim;
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
      v = new Vim(cloneDeep(input), cloneDeep(cursor), {
        keyBindings,
      });
      v.enterNormalMode();
    });

    describe("Finding", () => {
      it("F: Find potential chained commands (sideeffect)", () => {
        const result = v.findPotentialCommand("f");
        expect(map(result.potentialCommands, "command")).toEqual([
          "cursorDown",
          "yank",
        ]);
      });
      it("F: Return chained command name", () => {
        const { targetCommand } = v.findPotentialCommand("u");
        expect(targetCommand.command).toEqual("cursorDown");
      });
      it("F: Throw error on no match", () => {
        try {
          v.findPotentialCommand("x");
        } catch (error) {
          expect(error.message).toBe("Empty Array");
        }
      });
    });

    describe("Getting", () => {
      describe("#getCommandName", () => {
        it("F: Get command - Single", () => {
          const result = v.getCommandName("u");
          expect(result).toBe("cursorDown");
        });
        it("F: Get command - Chain", () => {
          //
          v.getCommandName("f");
          expect(map(v.potentialCommands, "command")).toEqual([
            "cursorDown",
            "yank",
          ]);
          //
          v.getCommandName("o");
          expect(map(v.potentialCommands, "command")).toEqual(["cursorDown"]);
          //
          const result = v.getCommandName("o");
          expect(result).toBe("cursorDown");
        });
      });
      //
      describe("#queueChainedInputs", () => {
        it("F: Single input", () => {
          const result = v.queueInput("u");
          expect(result.targetCommand).toBe("cursorDown");
          expect(result.commandOutput).toEqual({ col: 0, line: 1 });
        });
        //
        it("F: Chained input", () => {
          const result = v.queueChainedInputs("u");
          expect(result.targetCommand).toBe("cursorDown");
          expect(result.commandOutput).toEqual({ col: 0, line: 1 });
        });
        it("F: Chained input - lli!", () => {
          v = new Vim(cloneDeep(input), cloneDeep(cursor));
          const result = v.queueChainedInputs("lli!");
          expect(result.commandOutput).toBe("fo!o");
        });
      });
    });
  });
});
