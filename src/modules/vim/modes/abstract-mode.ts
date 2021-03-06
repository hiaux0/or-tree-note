import { VimOptions, VimPlugin } from '../vim.types';
import { cloneDeep } from 'lodash';
import { Logger } from 'modules/debug/logger';
import { VimState, VimMode } from '../vim.types';
import { getFirstNonWhiteSpaceCharIndex, replaceAt } from 'modules/string/string';

const logger = new Logger({ scope: 'AbstractMode' });

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string
) {
  if (cursorCol === activeInput.length + 1) return true;

  const isBigger = cursorCol > activeInput.length;
  /**
   * Should be > technically, but conceptionally, cursor and text index are off by one.
   */
  const isZero = cursorCol === 0;
  const result = !isBigger && !isZero;

  return result;
}

export function isValidVerticalPosition(line: number, lines: string[]) {
  const isBigger = line > lines.length;
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
  const regExp = /(\S+)/g;
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

  logger.debug(['Tokens: %o', tokens], { onlyVerbose: true });

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

  constructor(
    public vimState: VimState,
    public lines: string[],
    public vimOptions: VimOptions = {}
  ) {}

  executeCommand(
    commandName: string,
    commandInput: string,
    currentMode: VimMode
  ): VimState {
    const targetVimPluginCommand = this.vimOptions.vimPlugins?.find(
      (plugin) => {
        return plugin.commandName === commandName;
      }
    );
    if (targetVimPluginCommand) {
      const pluginResult = this.executeVimPluginCommand(
        targetVimPluginCommand,
        commandInput
      );
      if (pluginResult) {
        return pluginResult;
      }
      return;
    }

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
    const result = this[commandName](commandInput) as VimState;

    try {
      this.validateHorizontalCursor(result);
    } catch {
      logger.debug([
        'Not valid state. Returning to previous state: %o',
        previousOutput,
      ]);
      return previousOutput;
    }

    this.vimState = result;

    return result;
  }

  executeVimPluginCommand(targetVimPlugin: VimPlugin, commandValue: string) {
    return targetVimPlugin.execute(this.vimState, commandValue);
  }

  reTokenizeInput(input: string) {
    if (input === '') return;

    const tokenizedInput = tokenizeInput(input);

    logger.debug(['reTokenizeInput: %o', tokenizedInput], {
      onlyVerbose: true,
    });

    return tokenizedInput;
  }

  validateHorizontalCursor(vimState: VimState) {
    const curCol = vimState.cursor.col + 1;
    const isValid = isValidHorizontalPosition(curCol, vimState.text);

    if (!isValid) {
      try {
        logger.debug(
          [
            '[INVALID] Cursor col will be: %d, but should be between [0,%d].',
            curCol,
            vimState.text.length,
          ],
          {
            isError: true,
          }
        );
      } catch {
        throw '';
      }
    }

    return isValid;
  }

  validateVerticalCursor(vimState: VimState) {
    const line = vimState.cursor.line + 1;
    const isValid = isValidVerticalPosition(line, this.lines);

    if (!isValid) {
      logger.debug(
        [
          '[INVALID] Line will be: %d, but should be between [0,%d].',
          line,
          this.lines.length,
        ],
        {
          isError: true,
        }
      );
      throw '';
    }

    return isValid;
  }

  /******** */
  /* Cursor */
  /******** */
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
    const newCurLine = this.vimState.cursor.line - 1;
    const isValidVertical = isValidVerticalPosition(newCurLine + 1, this.lines);

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.length - 1, 0);
    }

    const newActiveText = this.lines[newCurLine];

    this.vimState.text = newActiveText;
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorDown(): VimState {
    1; /*?*/
    const newCurLine = this.vimState.cursor.line + 1;
    const isValidVertical = isValidVerticalPosition(newCurLine + 1, this.lines);

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.length - 1, 0);
    }

    const newActiveText = this.lines[newCurLine];

    this.vimState.text = newActiveText;
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorWordForwardEnd(): VimState {
    let tokenUnderCursor = this.getTokenUnderCursor();

    const isAtEnd = tokenUnderCursor?.end === this.vimState.cursor.col;
    const isNotAtEnd = tokenUnderCursor === undefined;

    let resultCol;
    if (isAtEnd) {
      const nextToken = this.getTokenAtIndex(tokenUnderCursor.index + 1);
      resultCol = nextToken.end;
    } else if (isNotAtEnd) {
      const nextToken = this.getNexToken();
      resultCol = nextToken.end;
    } else {
      resultCol = tokenUnderCursor.end;
    }

    if (resultCol) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
  cursorBackwordsStartWord(): VimState {
    let tokenUnderCursor = this.getTokenUnderCursor(); /*?*/

    this.vimState.cursor; /*?*/
    const isAtStart =
      tokenUnderCursor?.start === this.vimState.cursor.col; /*?*/
    const tokenNotUnderCursor = tokenUnderCursor === undefined;

    let resultCol;
    if (isAtStart) {
      const previousToken = this.getTokenAtIndex(tokenUnderCursor.index - 1);
      resultCol = previousToken.start;
    } else if (tokenNotUnderCursor) {
      const nextToken = this.getPreviousToken();
      resultCol = nextToken.start;
    } else {
      resultCol = tokenUnderCursor.start;
    }

    if (resultCol !== undefined) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
  cursorLineEnd(): VimState {
    this.vimState.cursor.col = this.vimState.text.length - 1;
    return this.vimState;
  }
  cursorLineStart(): VimState {
    const nonWhiteSpaceIndex = getFirstNonWhiteSpaceCharIndex(this.vimState.text);

    this.vimState.cursor.col = nonWhiteSpaceIndex;
    return this.vimState;
  }

  /**************** */
  /* Cursor Helpers */
  /**************** */
  getTokenUnderCursor(): TokenizedString | undefined {
    const tokenizedInput = this.reTokenizeInput(this.vimState.text);
    const targetToken = tokenizedInput.find((input) => {
      const curCol = this.vimState.cursor.col;
      const isUnderCursor = input.start <= curCol && curCol <= input.end;

      return isUnderCursor;
    });

    logger.debug(['Token under curor: %o', targetToken], {
      onlyVerbose: true,
    });

    return targetToken;
  }
  getTokenAtIndex(index: number) {
    const tokenizedInput = this.reTokenizeInput(this.vimState.text);

    if (index < 0) {
      index = 0;
    } else if (index > tokenizedInput.length - 1) {
      index = tokenizedInput.length - 1;
    }

    const targetToken = tokenizedInput[index];

    return targetToken;
  }
  getNexToken() {
    const tokenizedInput = this.reTokenizeInput(this.vimState.text);
    const curCol = this.vimState.cursor.col;
    const currentTokenIndex = tokenizedInput.findIndex((input) => {
      return input.end <= curCol;
    });
    const targetToken = tokenizedInput[currentTokenIndex + 1];

    if (!targetToken) {
      logger.debug(['Could not find next target token: %o', targetToken], {
        isError: true,
      });
    }
    return targetToken;
  }
  getPreviousToken() {
    const tokenizedInput = this.reTokenizeInput(this.vimState.text);
    const curCol = this.vimState.cursor.col;
    const currentToken = tokenizedInput.find((input) => {
      return input.end <= curCol;
    });

    if (!currentToken) {
      logger.debug(['Could not find next target token: %o', currentToken], {
        isError: true,
      });
    }
    return currentToken;
  }

  /****** */
  /* Text */
  /****** */
  indentRight(): VimState {
    const { indentSize } = this.vimOptions;
    const spaces = ' '.repeat(indentSize);
    const updatedInput = `${spaces}${this.vimState.text}`;

    this.vimState.text = updatedInput;
    this.vimState.cursor.col += indentSize;
    this.lines[this.vimState.cursor.line] = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }

  indentLeft(): VimState {
    const { indentSize } = this.vimOptions;
    const { text } = this.vimState;

    const numOfWhiteSpaceAtStart = text
      .substring(0, indentSize)
      .split('')
      .filter((char) => char === ' ').length;

    const updatedInput = text.substring(numOfWhiteSpaceAtStart); /*?*/

    this.vimState.text = updatedInput;
    this.vimState.cursor.col -= numOfWhiteSpaceAtStart;
    this.lines[this.vimState.cursor.line] = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  delete(): VimState {
    const updatedInput = replaceAt(
      this.vimState.text,
      this.vimState.cursor.col,
      ''
    );

    this.vimState.text = updatedInput;
    return this.vimState;
  }
}
