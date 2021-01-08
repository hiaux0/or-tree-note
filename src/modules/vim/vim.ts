import { insert } from "modules/string/string";
import { logger } from "./../debug/logger";
import hotkeys from "hotkeys-js";
import { AbstractMode } from "modules/vim/modes/modes";
import { NormalMode } from "modules/vim/modes/normal-mode";
import { InsertMode } from "modules/vim/modes/insert-mode";

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
    commandName: string,
    commandValue?: string
  ) {
    const currentMode = this.getCurrentMode();
    return currentMode.executeCommand(commandName, commandValue) as CommandType;
  }

  /** *************/
  /** Input Queue */
  /** *************/

  queueInput(input: string) {
    const result = this.executeCommand("type", input);

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
