import { Logger } from "modules/debug/logger";
import { Cursor, VimCommandOutput, VimMode } from "../vim";

const logger = new Logger({ scope: "AbstractMode" });

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string
) {
  if (cursorCol > activeInput.length) {
    return false;
  } else if (cursorCol < 0) {
    return false;
  }
  return true;
}

export abstract class AbstractMode {
  /**
   * Firstly: The active input, is the eg. "active line".
   *
   * TODO:
   * - multiple cursors
   */
  activeInput: string;
  currentMode: VimMode;

  constructor(public wholeInput: string[], public cursor: Cursor) {
    this.activeInput = wholeInput[cursor.line];
  }

  executeCommand(
    commandName: string,
    commandValue: string,
    currentMode?: VimMode
  ): VimCommandOutput {
    if (!this[commandName]) {
      logger.debug(
        [
          "No command '%s' found in %s Mode. ((modes.ts-executeCommand))",
          commandName,
          currentMode,
          this[commandName],
        ],
        { isError: true }
      );
    }

    const result = this[commandName](commandValue) as VimCommandOutput;

    if (result.text) {
      this.activeInput = result.text;
    }

    return result;
  }

  cursorRight(): VimCommandOutput {
    const updaterCursorCol = this.cursor.col + 1;

    if (!this.isValidHorizontalPosition(updaterCursorCol)) {
      return { cursor: { ...this.cursor } };
    }

    this.cursor.col = updaterCursorCol;
    return { cursor: { ...this.cursor } };
  }
  cursorLeft(): VimCommandOutput {
    const updaterCursorCol = this.cursor.col - 1;

    if (!this.isValidHorizontalPosition(updaterCursorCol)) {
      return { cursor: { ...this.cursor } };
    }

    this.cursor.col = updaterCursorCol;
    return { cursor: { ...this.cursor } };
  }
  cursorUp(): VimCommandOutput {
    this.cursor.line -= 1;
    return { cursor: { ...this.cursor } };
  }
  cursorDown(): VimCommandOutput {
    this.cursor.line += 1;
    return { cursor: { ...this.cursor } };
  }
  //
  isValidHorizontalPosition(cursorCol: number) {
    if (cursorCol > this.activeInput.length) {
      return false;
    } else if (cursorCol < 0) {
      return false;
    }
    return true;
  }
}
