import { VIM_COMMANDS } from "./vim-commands";
import { insert } from "modules/string/string";
import { logger } from "./../debug/logger";
import hotkeys from "hotkeys-js";
import { AbstractMode } from "modules/vim/modes/modes";
import { NormalMode } from "modules/vim/modes/normal-mode";
import { InsertMode } from "modules/vim/modes/insert-mode";
import { NormalModeKeybindings } from "./modes/normal-mode-commands";
import { InsertModeKeybindings } from "./modes/insert-mode-commands";
import keyBindingsJson from "../../resources/keybindings/key-bindings";

interface KeyBindingModes {
  normal: NormalModeKeybindings[];
  insert: InsertModeKeybindings[];
}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

export const vim = "vim";

/**
 * Given a string 'Hello, World'
 * And I'm in normal mode
 * When I type "l"
 * Then the cursor should move one right
 */

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
}

/**
 * First iteration: All vim needs is
 * - the input
 * - the cursor location
 */
export class Vim {
  vimMode: VimMode = VimMode.NORMAL;
  normalMode: NormalMode;
  insertMode: InsertMode;

  constructor(public wholeInput: string[], public cursor: Cursor) {
    this.normalMode = new NormalMode(wholeInput, cursor);
    this.insertMode = new InsertMode(wholeInput, cursor);

    this.verifyValidCursorPosition();
  }

  verifyValidCursorPosition() {
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

  /** *******/
  /** Modes */
  /** *******/

  enterInsertMode() {
    this.vimMode = VimMode.INSERT;
  }
  enterNormalMode() {
    this.vimMode = VimMode.NORMAL;
  }
  getCurrentMode() {
    if (this.vimMode === VimMode.NORMAL) {
      return this.normalMode;
    } else if (this.vimMode === VimMode.INSERT) {
      return this.insertMode;
    }
  }
  isInsertMode(mode: AbstractMode): mode is InsertMode {
    return this.vimMode === VimMode.INSERT;
  }
  isNormalMode(mode: AbstractMode): mode is NormalMode {
    return this.vimMode === VimMode.NORMAL;
  }

  /** **********/
  /** Commands */
  /** **********/

  executeCommand<CommandType = any>(
    commandName: typeof VIM_COMMANDS[number],
    commandValue?: string
  ) {
    const currentMode = this.getCurrentMode();
    return currentMode.executeCommand(commandName, commandValue) as CommandType;
  }

  getCommand(pressedKey: string): typeof VIM_COMMANDS[number] {
    const targetCommand = keyBindings[this.vimMode.toLowerCase()].find(
      (binding) => binding.key === pressedKey
    );

    if (!targetCommand) {
      logger.debug(
        ["No command for key: %s in Mode: %s", pressedKey, this.vimMode],
        { log: true }
      );

      if (this.vimMode === VimMode.INSERT) {
        logger.debug("Default to the command: type", { log: true });
        return "type";
      }

      return;
    }

    logger.debug(["Command: %s", targetCommand.command]);

    return targetCommand.command;
  }

  /** *************/
  /** Input Queue */
  /** *************/

  queueInput(input: string) {
    const targetCommand = this.getCommand(input);
    if (targetCommand === "enterInsertMode") {
      this.enterInsertMode();
      return;
    }
    const result = this.executeCommand(targetCommand, input);

    return result;
  }
  queueChainedInputs(inputChain: string | string[]) {
    let result;
    let givenInputChain;

    if (typeof inputChain === "string") {
      givenInputChain = inputChain.split("");
    } else {
      givenInputChain = inputChain;
    }

    givenInputChain.forEach((input, index) => {
      /** Save the last result */
      if (index === inputChain.length - 1) {
        result = this.queueInput(input);
        return;
      }
      this.queueInput(input);
    });

    return result;
  }
}
