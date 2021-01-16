import { cloneDeep } from "lodash";
import { Logger } from "modules/debug/logger";
import { VimState, VimMode } from "../vim";

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

export function isValidVerticalPosition(line: number, wholeInput: string[]) {
  const isBigger = line > wholeInput.length;
  /**
   * Should be > technically, but conceptionally, line and text index are off by one.
   */
  const isZero = line === 0;

  //
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
      end: matchIndex + matchedString.length - 1,
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

  constructor(public vimState: VimState, public wholeInput?: string[]) {
    this.tokenizedInput = tokenizeInput(vimState.text);

    logger.debug(["Tokens: %o", this.tokenizedInput], { onlyVerbose: true });
  }

  executeCommand(
    commandName: string,
    commandValue: string,
    currentMode: VimMode
  ): VimState {
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

    const previousOutput = cloneDeep(this.vimState);
    const result = this[commandName](commandValue) as VimState;

    try {
      this.validateHorizontalCursor(result);
    } catch {
      return previousOutput;
    }

    this.vimState = result;

    return result;
  }

  reTokenizeInput(input: string) {
    const tokenizedInput = tokenizeInput(input);

    logger.debug(["reTokenizeInput: %o", tokenizedInput], {
      onlyVerbose: true,
    });

    this.tokenizedInput = tokenizedInput;
    return tokenizedInput;
  }

  validateHorizontalCursor(vimState: VimState) {
    const curCol = vimState.cursor.col + 1;
    const isValid = isValidHorizontalPosition(curCol, vimState.text);

    if (!isValid) {
      !isValid; /*?*/
      try {
        logger.debug(
          [
            "[INVALID] Cursor col will be: %d, but should be between [0,%d].",
            curCol,
            vimState.text.length,
          ],
          {
            isError: true,
          }
        );
      } catch {
        throw "";
      }
    }

    return isValid;
  }

  validateVerticalCursor(vimState: VimState) {
    const line = vimState.cursor.line + 1;
    const isValid = isValidVerticalPosition(line, this.wholeInput);

    if (!isValid) {
      logger.debug(
        [
          "[INVALID] Line will be: %d, but should be between [0,%d].",
          line,
          this.wholeInput.length,
        ],
        {
          isError: true,
        }
      );
      throw "";
    }

    return isValid;
  }

  cursorRight(): VimState {
    const updaterCursorCol = this.vimState.cursor.col + 1;

    if (!isValidHorizontalPosition(updaterCursorCol + 1, this.vimState.text)) {
      return this.vimState;
    }

    this.vimState.cursor.col = updaterCursorCol;
    return this.vimState;
  }
  cursorLeft(): VimState {
    const updaterCursorCol = this.vimState.cursor.col - 1;

    if (!isValidHorizontalPosition(updaterCursorCol + 1, this.vimState.text)) {
      return this.vimState;
    }

    this.vimState.cursor.col = updaterCursorCol;
    return this.vimState;
  }
  cursorUp(): VimState {
    const newCurLine = this.vimState.cursor.line - 1; /*?*/
    const isValidVertical = isValidVerticalPosition(
      newCurLine + 1,
      this.wholeInput
    );

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.wholeInput[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = newActiveLine.length - 1;
    }

    const newActiveText = this.wholeInput[newCurLine];

    this.vimState.text = newActiveText;
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorDown(): VimState {
    const newCurLine = this.vimState.cursor.line + 1; /*?*/
    const isValidVertical = isValidVerticalPosition(
      newCurLine + 1,
      this.wholeInput
    );

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.wholeInput[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = newActiveLine.length - 1;
    }

    const newActiveText = this.wholeInput[newCurLine];

    this.vimState.text = newActiveText;
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
}
