import { cloneDeep } from 'lodash';
import { Logger } from 'modules/debug/logger';
import {
  getFirstNonWhiteSpaceCharIndex,
  replaceAt,
  StringUtil,
} from 'modules/string/string';

import { VimStateClass } from '../vim-state';
import { VimState, VimMode, VimOptions, VimPlugin } from '../vim-types';

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
    public vimOptions: VimOptions = {}
  ) {
    // this.vimState.lines = this.vimState.lines;
  }

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

    if (this[commandName] !== undefined) {
      logger.debug(
        [
          'No command "%s" found in %s Mode. ((modes.ts-executeCommand))',
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
        throw new Error();
      }
    }

    return isValid;
  }
  validateVerticalCursor(vimState: VimState) {
    const line = vimState.cursor.line + 1;
    const isValid = isValidVerticalPosition(line, this.vimState.lines);

    if (!isValid) {
      logger.debug(
        [
          '[INVALID] Line will be: %d, but should be between [0,%d].',
          line,
          this.vimState.lines.length,
        ],
        {
          isError: true,
        }
      );
      throw new Error();
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
    const isValidVertical = isValidVerticalPosition(
      newCurLine + 1,
      this.vimState.lines
    );
    this.vimState.lines; /* ? */

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.vimState.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.length - 1, 0);
    }

    const newActiveText = this.vimState.lines[newCurLine];

    // this.vimState.updateActiveLine(newActiveText);
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText);

    return this.vimState;
  }
  cursorDown(): VimStateClass {
    const newCurLine = this.vimState.cursor.line + 1;
    const isValidVertical = isValidVerticalPosition(
      newCurLine + 1,
      this.vimState.lines
    );

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.vimState.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.length - 1, 0);
    }

    const newActiveText = this.vimState.lines[newCurLine];

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

    if (resultCol) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
  cursorWordForwardStart(): VimStateClass {
    const nextToken = this.getNexToken();

    const isAtEnd = nextToken?.end === this.vimState.cursor.col;
    const isNotAtEnd = nextToken === undefined;

    let resultCol;
    if (isAtEnd) {
      const nextNextToken = this.getTokenAtIndex(nextToken.index + 1);
      resultCol = nextNextToken.end;
    } else if (isNotAtEnd) {
      const nextToken = this.getNexToken();
      resultCol = nextToken.end;
    } else {
      resultCol = nextToken.start;
    }

    if (resultCol) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
  cursorBackwordsStartWord(): VimStateClass {
    const tokenUnderCursor = this.getTokenUnderCursor(); /* ? */

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
  toCharacterAtBack(commandInput: string): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentTextFromStartToColumn = text.substring(0, cursor.col);
    const targetCharacterIndex = StringUtil.indexOfBack(
      currentTextFromStartToColumn,
      commandInput
    );

    if (targetCharacterIndex > -1) {
      this.vimState.cursor.col = targetCharacterIndex;
    }

    return this.vimState;
  }
  toCharacterAt(commandInput: string): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentTextToEnd = text.substring(cursor.col);
    const targetCharacterIndex = currentTextToEnd.indexOf(commandInput);

    if (targetCharacterIndex > -1) {
      const finalNewIndex = cursor.col + targetCharacterIndex; // before substring + target index
      this.vimState.cursor.col = finalNewIndex;
    }

    return this.vimState;
  }
  toCharacterAfterBack(commandInput: string): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentTextFromStartToColumn = text.substring(0, cursor.col);
    const targetCharacterIndex = StringUtil.indexOfBack(
      currentTextFromStartToColumn,
      commandInput
    );

    if (targetCharacterIndex > -1) {
      this.vimState.cursor.col = targetCharacterIndex + 1; // + 1 after char
    }

    return this.vimState;
  }
  toCharacterBefore(commandInput: string): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentTextToEnd = text.substring(cursor.col);
    const targetCharacterIndex = currentTextToEnd.indexOf(commandInput);
    if (targetCharacterIndex > 0) {
      // ^ -1: stay, 0: stay, cos at beginning
      const finalNewIndex = cursor.col + targetCharacterIndex - 1; // before substring + target index - before character
      this.vimState.cursor.col = finalNewIndex;
    }

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

    /* prettier-ignore */ logger.debug(['Token under curor: %o', targetToken], { onlyVerbose: true, });

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
    const currentToken = this.getTokenUnderCursor();

    let nextIndex = NaN;
    if (currentToken == null) {
      nextIndex = this.getNextTokenFromCusor(tokenizedInput).index;
    } else {
      nextIndex = currentToken.index + 1;
    }

    const nextToken = tokenizedInput[nextIndex];

    if (nextToken == null) {
      return currentToken;
    }
    return nextToken;
  }
  private getNextTokenFromCusor(tokenizedInput: TokenizedString[]) {
    const currentCol = this.vimState.cursor.col;
    const maybeNext = tokenizedInput.find((input) => input.end >= currentCol);

    if (maybeNext == null) {
      return tokenizedInput[0];
    }

    return maybeNext;
  }
  getPreviousToken() {
    const tokenizedInput = this.reTokenizeInput(this.vimState.getActiveLine());
    const currentToken = this.getTokenUnderCursor();
    const previousToken = tokenizedInput[currentToken.index - 1];

    if (previousToken === undefined) {
      return currentToken;
    }
    return previousToken;
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
    this.vimState.lines[this.vimState.cursor.line] = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  indentLeft(): VimStateClass {
    const { indentSize } = this.vimOptions;
    const text = this.vimState.getActiveLine();

    const stagedSubText = text.substring(0, indentSize);
    const whiteSpaceAtStartIndex = /\w/g.exec(stagedSubText);
    let numOfWhiteSpaceAtStart = stagedSubText.length;
    if (whiteSpaceAtStartIndex !== null) {
      numOfWhiteSpaceAtStart = whiteSpaceAtStartIndex.index;
    }

    const updatedInput = text.substring(numOfWhiteSpaceAtStart);
    this.vimState.updateActiveLine(updatedInput);
    this.vimState.cursor.col -= numOfWhiteSpaceAtStart;
    this.vimState.lines[this.vimState.cursor.line] = updatedInput;
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
  replace(commandInput: string): VimStateClass {
    const text = this.vimState.getActiveLine();
    const { col } = this.vimState.cursor;
    const replaced = replaceAt(text, col, commandInput);
    this.vimState.updateActiveLine(replaced);
    return this.vimState;
  }
  backspace(): VimStateClass {
    return this.vimState;
  }

  /** `o` */
  createNewLine(): VimStateClass {
    // add new line below
    const currentLine = this.vimState.getActiveLine();
    const newLineIndex = this.vimState.cursor.line + 1;
    const tempLines = [...this.vimState.lines];
    const numOfWs = StringUtil.getLeadingWhitespaceNum(currentLine);
    tempLines.splice(newLineIndex, 0, ' '.repeat(numOfWs));
    this.vimState.cursor.col = numOfWs;
    // put cursor below
    this.vimState.cursor.line = this.vimState.cursor.line + 1;
    this.vimState.lines = tempLines;
    // this.vimState.mode = VimMode.INSERT;

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: abstract-mode.ts ~ line 502 ~ createNewLine');
    return this.vimState;
  }

  /** Lines */
  deleteLine(): VimStateClass {
    const curLine = this.vimState.cursor.line;
    // /* prettier-ignore */ console.trace('>>>> _ >>>> ~ file: abstract-mode.ts ~ line 504 ~ curLine', curLine);
    this.vimState.lines.splice(curLine, 1);

    let newCol = 0;
    if (this.vimState.getPreviousLine()) {
      newCol = Math.max(0, this.vimState.getPreviousLine().length - 1);
    } else {
      newCol = 0;
    }
    this.vimState.cursor.col = newCol;

    this.vimState.cursor.line = Math.max(curLine - 1, 0);
    const activeLine = this.vimState.getActiveLine();
    this.vimState.updateActiveLine(activeLine ?? '');

    //
    this.vimState.deletedLinesIndeces = [curLine];

    return this.vimState;
  }

  joinLine(): VimStateClass {
    const prev = this.vimState.getPreviousLine();
    const active = this.vimState.getActiveLine();
    const joined = prev.concat(active);

    const prevCursor = this.vimState.cursor.line - 1;
    this.vimState.updateLine(prevCursor, joined);
    this.deleteLine();
    this.vimState.cursor.col = prev.length;

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
