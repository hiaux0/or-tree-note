import { cloneDeep } from 'lodash';
import { Logger } from 'modules/debug/logger';
import {
  getFirstNonWhiteSpaceCharIndex,
  replaceAt,
} from 'modules/string/string';
import { VimStateClass } from '../vim-state';

import { VimState, VimMode, VimOptions, VimPlugin } from '../vim.types';

const logger = new Logger({ scope: 'AbstractMode' });

export interface TokenizedString {
  string: string;
  start: number;
  end: number;
  index: number;
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
    public vimState: VimStateClass,
    public lines: string[],
    public vimOptions: VimOptions = {}
  ) {}

  executeCommand(
    commandName: string,
    commandInput: string,
    currentMode: VimMode
  ): VimStateClass {
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
        ],
        { isError: true }
      );
    }

    const previousOutput = cloneDeep(this.vimState); // side effect, thus clone before executing command
    const result = this[commandName](commandInput) as VimStateClass;

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

  validateHorizontalCursor(vimState: VimStateClass) {
    const curCol = vimState.cursor.col + 1;
    const isValid = isValidHorizontalPosition(curCol, vimState.getActiveLine());

    if (!isValid) {
      try {
        logger.debug(
          [
            '[INVALID] Cursor col will be: %d, but should be between [0,%d].',
            curCol,
            vimState.getActiveLine().length,
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

  /** ****** */
  /* Cursor */
  /** ****** */
  cursorRight(): VimStateClass {
    const updaterCursorCol = this.vimState.cursor.col + 1;

    if (
      !isValidHorizontalPosition(
        updaterCursorCol + 1,
        this.vimState.getActiveLine()
      )
    ) {
      return this.vimState;
    }

    this.vimState.cursor.col = updaterCursorCol;
    return this.vimState;
  }
  cursorLeft(): VimStateClass {
    const updaterCursorCol = this.vimState.cursor.col - 1;

    if (
      !isValidHorizontalPosition(
        updaterCursorCol + 1,
        this.vimState.getActiveLine()
      )
    ) {
      return this.vimState;
    }

    this.vimState.cursor.col = updaterCursorCol;
    return this.vimState;
  }
  cursorUp(): VimStateClass {
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

    this.vimState.updateActiveLine(newActiveText);
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorDown(): VimStateClass {
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

    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorWordForwardEnd(): VimStateClass {
    const tokenUnderCursor = this.getTokenUnderCursor();

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

    resultCol; /*?*/
    if (resultCol) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
  cursorBackwordsStartWord(): VimStateClass {
    const tokenUnderCursor = this.getTokenUnderCursor(); /* ? */

    this.vimState.cursor; /* ? */
    const isAtStart =
      tokenUnderCursor?.start === this.vimState.cursor.col; /* ? */
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
  cursorLineEnd(): VimStateClass {
    this.vimState.cursor.col = this.vimState.getActiveLine().length - 1;
    return this.vimState;
  }
  cursorLineStart(): VimStateClass {
    const nonWhiteSpaceIndex = getFirstNonWhiteSpaceCharIndex(
      this.vimState.getActiveLine()
    );

    this.vimState.cursor.col = nonWhiteSpaceIndex;
    return this.vimState;
  }

  /** ************** */
  /* Cursor Helpers */
  /** ************** */
  getTokenUnderCursor(): TokenizedString | undefined {
    const tokenizedInput = this.reTokenizeInput(this.vimState.getActiveLine());
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
    const tokenizedInput = this.reTokenizeInput(this.vimState.getActiveLine());

    if (index < 0) {
      index = 0;
    } else if (index > tokenizedInput.length - 1) {
      index = tokenizedInput.length - 1;
    }

    const targetToken = tokenizedInput[index];

    return targetToken;
  }
  getNexToken() {
    const tokenizedInput = this.reTokenizeInput(this.vimState.getActiveLine());
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
    const tokenizedInput = this.reTokenizeInput(this.vimState.getActiveLine());
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

  /** **** */
  /* Text */
  /** **** */
  indentRight(): VimStateClass {
    const { indentSize } = this.vimOptions;
    const spaces = ' '.repeat(indentSize);
    const updatedInput = `${spaces}${this.vimState.getActiveLine()}`;

    this.vimState.updateActiveLine(updatedInput);

    this.vimState.cursor.col += indentSize;
    this.lines[this.vimState.cursor.line] = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }

  indentLeft(): VimStateClass {
    const { indentSize } = this.vimOptions;
    const text = this.vimState.getActiveLine();

    const numOfWhiteSpaceAtStart = text
      .substring(0, indentSize)
      .split('')
      .filter((char) => char === ' ').length;

    const updatedInput = text.substring(numOfWhiteSpaceAtStart); /* ? */

    this.vimState.updateActiveLine(updatedInput);

    this.vimState.cursor.col -= numOfWhiteSpaceAtStart;
    this.lines[this.vimState.cursor.line] = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  delete(): VimStateClass {
    const updatedInput = replaceAt(
      this.vimState.getActiveLine(),
      this.vimState.cursor.col,
      ''
    );

    this.vimState.updateActiveLine(updatedInput);

    return this.vimState;
  }

  nothing(): VimStateClass {
    return this.vimState;
  }
}

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
