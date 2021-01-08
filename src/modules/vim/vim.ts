import { VimCommandNames, VimCommands, VIM_COMMANDS } from "./vim-commands";
import { filterStringByCharSequence, insert } from "modules/string/string";
import { logger } from "./../debug/logger";
import hotkeys from "hotkeys-js";
import { AbstractMode } from "modules/vim/modes/modes";
import { NormalMode } from "modules/vim/modes/normal-mode";
import { InsertMode } from "modules/vim/modes/insert-mode";
import { NormalModeKeybindings } from "./modes/normal-mode-commands";
import { InsertModeKeybindings } from "./modes/insert-mode-commands";
import keyBindingsJson from "../../resources/keybindings/key-bindings";

export interface KeyBindingModes {
  normal: VimCommands[];
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

interface FindPotentialCommandReturn {
  targetCommand: VimCommands;
  potentialCommands: VimCommands[];
}

interface QueueInputReturn {
  commandOutput: any;
  targetCommand: VimCommandNames;
}

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
}
export interface VimOptions {
  keyBindings: KeyBindingModes;
}

const defaultVimOptions: VimOptions = {
  keyBindings,
};

/**
 * First iteration: All vim needs is
 * - the input
 * - the cursor location
 */
export class Vim {
  vimMode: VimMode = VimMode.NORMAL;
  normalMode: NormalMode;
  insertMode: InsertMode;

  /** Alias for vimOptions.keyBindings */
  keyBindings: KeyBindingModes;

  potentialCommands: VimCommands[];
  /** If a command did not trigger, save key */
  queuedKeys: string[] = [];

  constructor(
    public wholeInput: string[],
    public cursor: Cursor,
    public vimOptions: VimOptions = defaultVimOptions
  ) {
    this.normalMode = new NormalMode(wholeInput, cursor);
    this.insertMode = new InsertMode(wholeInput, cursor);

    this.keyBindings = vimOptions.keyBindings;

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
    commandName: VimCommandNames,
    commandValue?: string
  ) {
    const currentMode = this.getCurrentMode();
    return currentMode.executeCommand(commandName, commandValue) as CommandType;
  }

  /**
   * @throws EmpytArrayException
   * @sideeffect queuedKeys
   * @sideeffect potentialCommands
   */
  findPotentialCommand(pressedKey: string): FindPotentialCommandReturn {
    //
    let targetKeyBinding;

    if (this.potentialCommands) {
      targetKeyBinding = this.potentialCommands;
    } else {
      targetKeyBinding = this.keyBindings[
        this.vimMode.toLowerCase()
      ] as VimCommands[];
    }

    //
    let keySequence;

    if (this.queuedKeys) {
      keySequence = this.queuedKeys.join("").concat(pressedKey);
    } else {
      keySequence = pressedKey;
    }

    //
    let targetCommand;
    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      const result = filterStringByCharSequence(keyBinding.key, keySequence);
      return result;
    });

    if (potentialCommands.length === 0) {
      throw new Error("Empty Array");
    } else if (
      potentialCommands.length === 1 &&
      keySequence === potentialCommands[0].key
    ) {
      targetCommand = potentialCommands[0];
      this.emptyQueuedKeys();
    } else {
      this.queuedKeys.push(pressedKey);
      this.potentialCommands = potentialCommands;
    }

    //
    return { targetCommand, potentialCommands };
  }

  /** */
  getCommandName(pressedKey: string): VimCommandNames {
    let potentialCommands;
    let targetCommand;

    try {
      ({ potentialCommands, targetCommand } = this.findPotentialCommand(
        pressedKey
      ));
    } catch {}

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

  emptyQueuedKeys() {
    this.queuedKeys = [];
  }

  /** *************/
  /** Input Queue */
  /** *************/

  queueInput(input: string): QueueInputReturn {
    const targetCommand = this.getCommandName(input);
    if (targetCommand === "enterInsertMode") {
      this.enterInsertMode();
      return;
    }
    const commandOutput = this.executeCommand(targetCommand, input);

    return { commandOutput, targetCommand };
  }
  //
  queueChainedInputs(inputChain: string | string[]): QueueInputReturn {
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
