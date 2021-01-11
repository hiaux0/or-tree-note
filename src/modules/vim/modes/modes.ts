import { Logger } from "modules/debug/logger";
import { Cursor, VimCommandOutput, VimMode } from "../vim";

const logger = new Logger({ scope: "AbstractMode" });

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string
) {
  let result = true;
  if (cursorCol > activeInput.length - 1) {
    result = false;
  } else if (cursorCol < 0) {
    result = false;
  }
  return result;
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

  constructor(public vimCommandOutput: VimCommandOutput) {}

  executeCommand(
    commandName: string,
    commandValue: string,
    currentMode: VimMode
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
      this.vimCommandOutput.text = result.text;
    }

    return result;
  }

  cursorRight(): VimCommandOutput {
    const updaterCursorCol = this.vimCommandOutput.cursor.col + 1;

    if (
      !isValidHorizontalPosition(updaterCursorCol, this.vimCommandOutput.text)
    ) {
      return {
        cursor: { ...this.vimCommandOutput.cursor },
        text: this.vimCommandOutput.text,
      };
    }

    this.vimCommandOutput.cursor.col = updaterCursorCol;
    return {
      cursor: { ...this.vimCommandOutput.cursor },
      text: this.vimCommandOutput.text,
    };
  }
  cursorLeft(): VimCommandOutput {
    const updaterCursorCol = this.vimCommandOutput.cursor.col - 1;

    if (
      !isValidHorizontalPosition(updaterCursorCol, this.vimCommandOutput.text)
    ) {
      return {
        cursor: { ...this.vimCommandOutput.cursor },
        text: this.vimCommandOutput.text,
      };
    }

    this.vimCommandOutput.cursor.col = updaterCursorCol;
    return {
      cursor: { ...this.vimCommandOutput.cursor },
      text: this.vimCommandOutput.text,
    };
  }
  cursorUp(): VimCommandOutput {
    this.vimCommandOutput.cursor.line -= 1;
    return {
      cursor: { ...this.vimCommandOutput.cursor },
      text: this.vimCommandOutput.text,
    };
  }
  cursorDown(): VimCommandOutput {
    this.vimCommandOutput.cursor.line += 1;
    return {
      cursor: { ...this.vimCommandOutput.cursor },
      text: this.vimCommandOutput.text,
    };
  }
}
