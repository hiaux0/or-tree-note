import { Logger } from "modules/debug/logger";
import { Cursor, VimCommandOutput, VimMode } from "../vim";

const logger = new Logger({ scope: "AbstractMode" });

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string
) {
  const isBigger = cursorCol > activeInput.length;
  /**
   * Should be > technically, but conceptionally, cursor and text index are off by one.
   */
  const isZero = cursorCol === 0;
  const result = !isBigger && !isZero;

  return result;
}

export interface TokenizedString {
  string: string;
  start: number;
  end: number;
  index: number;
}

export function tokenizeInput(input: string): TokenizedString[] {
  const regExp = /(\w+)/g;
  const matchResult: RegExpExecArray[] = [];
  let match: RegExpExecArray;

  while ((match = regExp.exec(input))) {
    matchResult.push(match);
  }

  const tokens = matchResult.map((result, resultIndex) => {
    const matchedString = result[0];
    const { index: matchIndex } = result;
    const token: TokenizedString = {
      string: matchedString,
      start: matchIndex,
      end: resultIndex + matchIndex + matchedString.length - 1,
      index: resultIndex,
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

    logger.debug(["Tokens: %o", this.tokenizedInput], { onlyVerbose: true });
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

    try {
      this.validateHorizontalCursor(result);
    } catch {
      const previousOutput = this.vimCommandOutput;
      return previousOutput;
    }

    this.vimCommandOutput = result;

    return result;
  }

  validateHorizontalCursor(vimCommandOutput: VimCommandOutput) {
    const curCol = vimCommandOutput.cursor.col + 1;
    const isValid = isValidHorizontalPosition(curCol, vimCommandOutput.text);

    if (!isValid) {
      logger.debug(
        [
          "[INVALID] Cursor col will be: %d, but should be between [0,%d].",
          curCol,
          vimCommandOutput.text.length,
        ],
        {
          isError: true,
        }
      );
      throw "";
    }

    return isValid;
  }

  cursorRight(): VimCommandOutput {
    const updaterCursorCol = this.vimCommandOutput.cursor.col + 1;

    if (
      !isValidHorizontalPosition(
        updaterCursorCol + 1,
        this.vimCommandOutput.text
      )
    ) {
      return this.vimCommandOutput;
    }

    this.vimCommandOutput.cursor.col = updaterCursorCol;
    return this.vimCommandOutput;
  }
  cursorLeft(): VimCommandOutput {
    const updaterCursorCol = this.vimCommandOutput.cursor.col - 1;

    if (
      !isValidHorizontalPosition(
        updaterCursorCol + 1,
        this.vimCommandOutput.text
      )
    ) {
      return this.vimCommandOutput;
    }

    this.vimCommandOutput.cursor.col = updaterCursorCol;
    return this.vimCommandOutput;
  }
  cursorUp(): VimCommandOutput {
    this.vimCommandOutput.cursor.line -= 1;
    return this.vimCommandOutput;
  }
  cursorDown(): VimCommandOutput {
    this.vimCommandOutput.cursor.line += 1;
    return this.vimCommandOutput;
  }
}
