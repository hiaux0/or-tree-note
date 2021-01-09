import { logger } from "modules/debug/logger";
import { Cursor, VimMode } from "../vim";

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
  ) {
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

    const result = this[commandName](commandValue);

    this.activeInput = result;

    return result;
  }

  cursorRight() {
    const updaterCursorCol = this.cursor.col + 1;

    if (!this.isValidHorizontalPosition(updaterCursorCol)) {
      return this.cursor;
    }

    this.cursor.col = updaterCursorCol;
    return this.cursor;
  }
  cursorLeft() {
    const updaterCursorCol = this.cursor.col - 1;

    if (!this.isValidHorizontalPosition(updaterCursorCol)) {
      return this.cursor;
    }

    this.cursor.col = updaterCursorCol;
    return this.cursor;
  }
  cursorUp() {
    this.cursor.line -= 1;
    return this.cursor;
  }
  cursorDown() {
    this.cursor.line += 1;
    return this.cursor;
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
