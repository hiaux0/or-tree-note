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

export interface TokenizedString {
  string: string;
  start: number;
  end: number;
}

export function tokenizeInput(input: string): TokenizedString[] {
  const regExp = /(\w+)/g;
  const matchResult: RegExpExecArray[] = [];
  let match: RegExpExecArray;

  while ((match = regExp.exec(input))) {
    matchResult.push(match);
  }

  const tokens = matchResult.map((result) => {
    const matchedString = result[0];
    const { index } = result;
    const token: TokenizedString = {
      string: matchedString,
      start: index,
      end: index + matchedString.length - 1,
    };
    return token;
  });

  return tokens;
}

export abstract class AbstractMode {
  /**
   * Firstly: The active input, is the eg. "active line".
   *
   * TODO:
   * - multiple cursors
   */
  currentMode: VimMode;
  tokenizedInput: TokenizedString[];

  constructor(public vimCommandOutput: VimCommandOutput) {
    this.tokenizedInput = tokenizeInput(vimCommandOutput.text);
  }

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
