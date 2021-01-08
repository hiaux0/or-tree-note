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
  activeMode: VimMode;

  constructor(public wholeInput: string[], public cursor: Cursor) {
    this.activeInput = wholeInput[cursor.line];
  }

  executeCommand(commandName: string, commandValue: string) {
    if (!this[commandName]) {
      logger.debug(["No command '%s' found in Insert Mode", commandName]);
    }

    const result = this[commandName](commandValue);

    this.activeInput = result;

    return result;
  }

  cursorRight() {
    this.cursor.col += 1;
    return this.cursor;
  }
}
