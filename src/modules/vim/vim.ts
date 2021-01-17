import { SPACE } from "./../../resources/keybindings/app.keys";
import { Logger } from "./../debug/logger";
import keyBindingsJson from "../../resources/keybindings/key-bindings";
import {
  VimOptions,
  Cursor,
  QueueInputReturn,
  KeyBindingModes,
  VimExecutingMode,
} from "./vim.types";
import { VimCommandManager } from "./vim-command-manager";

const logger = new Logger({ scope: "Vim" });

export class VimError extends Error {}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

export const vim = "vim";

export const defaultVimOptions: VimOptions = {
  keyBindings,
  leader: SPACE,
};

/**
 * First iteration: All vim needs is
 * - the input
 * - the cursor location
 */
export class Vim {
  vimCommandManager: VimCommandManager;

  constructor(
    public wholeInput: string[],
    public cursor: Cursor = { line: 0, col: 0 },
    public vimOptions?: VimOptions
  ) {
    const finalVimOptions = {
      ...defaultVimOptions,
      ...this.vimOptions,
    };
    this.vimCommandManager = new VimCommandManager(
      this.wholeInput,
      this.cursor,
      finalVimOptions
    );

    this.verifyValidCursorPosition();
  }

  private verifyValidCursorPosition() {
    const cursorCol = this.cursor.col;
    const cursorLine = this.cursor.line;
    if (cursorCol < 0) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Must not be negative, but column is ${cursorCol}`
      );
    } else if (cursorLine < 0) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Must not be negative, but line is ${cursorLine}`
      );
    } else if (!this.wholeInput[cursorLine]) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.wholeInput.length} lines, but cursor line is: ${cursorLine}`
      );
    } else if (cursorCol > this.wholeInput[cursorLine].length) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.wholeInput[cursorLine].length} columns, but cursor column is: ${cursorCol}`
      );
    }
  }

  /** *************/
  /** Input Queue */
  /** *************/

  /** */
  queueInput(input: string): QueueInputReturn {
    logger.debug(["Received input: %s", input]);

    //
    let targetCommandName;
    try {
      targetCommandName = this.vimCommandManager.getCommandName(input);
    } catch (error) {
      console.log("TCL: Vim -> queueInput -> error", error);
      return null;
    }

    if (!targetCommandName) {
      return null;
    }

    let vimState;
    if (targetCommandName === "enterInsertTextMode") {
      vimState = this.vimCommandManager.enterInsertTextMode();
    } else if (targetCommandName === "enterNormalTextMode") {
      vimState = this.vimCommandManager.enterNormalTextMode();
    } else {
      vimState = this.vimCommandManager.executeVimCommand(
        targetCommandName,
        input
      );
    }

    //
    this.vimCommandManager.setVimState(vimState);

    //
    const result = {
      vimState,
      targetCommand: targetCommandName,
      wholeInput: [...this.wholeInput],
    };

    logger.debug(["Result of input: %s is: %o", input, result], {
      onlyVerbose: true,
    });

    return result;
  }

  /** */
  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturn[] {
    let resultList: QueueInputReturn[] = [];
    let givenInputSequence;

    if (typeof inputSequence === "string") {
      givenInputSequence = this.vimCommandManager.splitInputSequence(
        inputSequence
      );
    } else {
      givenInputSequence = inputSequence;
    }

    givenInputSequence.forEach((input) => {
      const subResult = this.queueInput(input);
      resultList.push(subResult);
    });

    if (vimExecutingMode === VimExecutingMode.INDIVIDUAL) {
      return resultList;
    }

    return this.vimCommandManager.batchResults(resultList);
  }

  getCurrentMode() {
    return this.vimCommandManager.getCurrentMode();
  }
  enterInsertTextMode() {
    return this.vimCommandManager.enterInsertTextMode();
  }
  enterNormalTextMode() {
    return this.vimCommandManager.enterNormalTextMode();
  }
}
