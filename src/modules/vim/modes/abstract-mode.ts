import { Logger } from 'common/logging/logging';
import { cloneDeep } from 'lodash';
import { ArrayUtils, ThreeSplitType } from 'modules/array/array-utils';
import { DebugService } from 'modules/debug/debugService';
import {
  getFirstNonWhiteSpaceCharIndex,
  replaceAt,
  StringUtil,
} from 'modules/string/string';

import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import {
  VimMode,
  VimOptions,
  VimPlugin,
  VimLine,
  VimStateV2,
} from '../vim-types';
import { toggleFold } from './features/folding';

const logger = new Logger('AbstractMode', { log: true, disableLogger: false });

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

  async executeCommand(
    commandName: VIM_COMMAND,
    commandInput: unknown,
    currentMode: VimMode
  ): Promise<VimStateClass> {
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

    if (this[commandName] === undefined) {
      logger.culogger.debug(
        [
          'No command "%s" found in %s Mode. ((modes.ts-executeCommand))',
          commandName,
          currentMode,
        ],
        { log: true, isError: true }
      );
      return;
    }

    const previousOutput = cloneDeep(this.vimState); // side effect, thus clone before executing command
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = (await this[commandName](commandInput)) as VimStateClass;

    try {
      this.validateHorizontalCursor(result);
    } catch {
      logger.culogger.debug([
        'Not valid state. Returning to previous state: %o',
        previousOutput,
      ]);
      return previousOutput;
    }

    this.vimState = result;

    return result;
  }
  executeVimPluginCommand(targetVimPlugin: VimPlugin, commandValue: unknown) {
    // return targetVimPlugin.execute(this.vimState, commandValue);

    const pluginResult = targetVimPlugin.execute(this.vimState, commandValue);
    if (pluginResult) {
      return pluginResult;
    }

    return this.vimState;
  }

  reTokenizeInput(input: string) {
    if (input === '') return;

    const tokenizedInput = tokenizeInput(input);

    logger.culogger.debug(['reTokenizeInput: %o', tokenizedInput], {
      onlyVerbose: true,
    });

    return tokenizedInput;
  }
  validateHorizontalCursor(vimState: VimStateClass) {
    const curCol = vimState.cursor.col + 1;
    const isValid = isValidHorizontalPosition(
      curCol,
      vimState.getActiveLine().text
    );

    if (!isValid) {
      try {
        logger.culogger.debug(
          [
            '[INVALID] Cursor col will be: %d, but should be between [0,%d].',
            curCol,
            vimState.getActiveLine().text.length,
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
  validateVerticalCursor(vimState: VimStateV2) {
    const line = vimState.cursor.line + 1;
    const isValid = isValidVerticalPosition(line, this.vimState.lines);

    if (!isValid) {
      logger.culogger.debug(
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
    this.moveRight(1);
    return this.vimState;
  }
  cursorLeft(): VimStateClass {
    const updaterCursorCol = this.vimState.cursor.col - 1;

    if (
      !isValidHorizontalPosition(
        updaterCursorCol + 1,
        this.vimState.getActiveLine().text
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

    if (!isValidVertical) {
      return this.vimState;
    }

    const newActiveLine = this.vimState.lines[newCurLine];
    const isValidHorizontalAfterMovedVertically = isValidHorizontalPosition(
      this.vimState.cursor.col + 1,
      newActiveLine.text
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.text.length - 1, 0);
    }

    const newActiveText = this.vimState.lines[newCurLine];

    // this.vimState.updateActiveLine(newActiveText);
    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText.text);

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
      newActiveLine.text
    );

    if (!isValidHorizontalAfterMovedVertically) {
      // TODO: Call "$" to put cursor to end of line
      this.vimState.cursor.col = Math.max(newActiveLine.text.length - 1, 0);
    }

    const newActiveText = this.vimState.lines[newCurLine];

    this.vimState.cursor.line = newCurLine;
    this.reTokenizeInput(newActiveText.text);

    return this.vimState;
  }
  cursorWordForwardEnd(): VimStateClass {
    const tokenUnderCursor = this.getTokenUnderCursor();

    const isAtEnd = tokenUnderCursor?.end === this.vimState.cursor.col;
    const isNotAtEnd = tokenUnderCursor === undefined;

    let resultCol: number;
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

    let resultCol: number;
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
    let tokenUnderCursor: TokenizedString;
    tokenUnderCursor = this.getTokenUnderCursor();
    if (!tokenUnderCursor) {
      tokenUnderCursor = this.getPreviousToken();
    }

    const isAtStart = tokenUnderCursor?.start === this.vimState.cursor.col;
    const tokenNotUnderCursor = tokenUnderCursor === undefined;

    let resultCol: number;
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
    this.vimState.cursor.col = Math.max(
      this.vimState.getActiveLine().text.length - 1,
      0
    );
    return this.vimState;
  }
  cursorLineStart(): VimStateClass {
    const nonWhiteSpaceIndex = getFirstNonWhiteSpaceCharIndex(
      this.vimState.getActiveLine().text
    );

    this.vimState.cursor.col = nonWhiteSpaceIndex;
    return this.vimState;
  }
  jumpNextBlock(): VimStateClass {
    let finalLine = NaN;
    const nextNonEmptyLineIndex = ArrayUtils.findIndexFromIndex(
      this.vimState.lines,
      this.vimState.cursor.line,
      (line) => {
        const isEmpty = line.text.trim() !== '';
        return isEmpty;
      }
    );
    const amountOnEmptyLines =
      this.vimState.cursor.line - nextNonEmptyLineIndex + 1; // don't count starting line
    let startingIndex;

    if (amountOnEmptyLines === 0) {
      startingIndex = this.vimState.cursor.line;
    } else {
      startingIndex = nextNonEmptyLineIndex + 1;
    }

    const previousBlockIndex = ArrayUtils.findIndexFromIndex(
      this.vimState.lines,
      startingIndex,
      (line) => {
        const isEmpty = line.text.trim() === '';
        return isEmpty;
      }
    );

    finalLine = previousBlockIndex;
    if (previousBlockIndex === this.vimState.cursor.line) {
      /** When we go up, but find nothing, means we should go to very top */
      finalLine = this.vimState.lines.length - 1;
    } else if (previousBlockIndex >= 0) {
      finalLine = previousBlockIndex;
    }

    this.vimState.cursor.line = finalLine;

    return this.vimState;
  }
  jumpPreviousBlock(): VimStateClass {
    let finalLine = NaN;
    const nextNonEmptyLineIndex = ArrayUtils.findIndexBackwardFromIndex(
      this.vimState.lines,
      this.vimState.cursor.line,
      (line) => {
        const isEmpty = line.text.trim() !== '';
        return isEmpty;
      }
    );
    const amountOnEmptyLines =
      this.vimState.cursor.line - nextNonEmptyLineIndex - 1; // don't count starting line
    let startingIndex;

    if (amountOnEmptyLines === 0) {
      startingIndex = this.vimState.cursor.line;
    } else {
      startingIndex = nextNonEmptyLineIndex - 1;
    }

    const previousBlockIndex = ArrayUtils.findIndexBackwardFromIndex(
      this.vimState.lines,
      startingIndex,
      (line) => {
        const isEmpty = line.text.trim() === '';
        return isEmpty;
      }
    );

    finalLine = previousBlockIndex;
    if (previousBlockIndex === this.vimState.cursor.line) {
      /** When we go up, but find nothing, means we should go to very top */
      finalLine = 0;
    } else if (previousBlockIndex >= 0) {
      finalLine = previousBlockIndex;
    }

    this.vimState.cursor.line = finalLine;

    return this.vimState;
  }
  toCharacterAtBack(commandInput: string): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine().text;
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
    const text = this.vimState.getActiveLine().text;
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
    const text = this.vimState.getActiveLine().text;
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
    const text = this.vimState.getActiveLine().text;
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
  public moveRight(amount: number): VimStateClass {
    const updaterCursorCol = this.vimState.cursor.col + amount;

    const valid = isValidHorizontalPosition(
      updaterCursorCol + 1,
      this.vimState.getActiveLine().text
    );
    if (!valid) {
      return this.vimState;
    }

    this.vimState.cursor.col = updaterCursorCol;
    return this.vimState;
  }
  getTokenUnderCursor(): TokenizedString | undefined {
    const tokenizedInput = this.reTokenizeInput(
      this.vimState.getActiveLine().text
    );
    const targetToken = tokenizedInput.find((input) => {
      const curCol = this.vimState.cursor.col;
      const isUnderCursor = input.start <= curCol && curCol <= input.end;

      return isUnderCursor;
    });

    /* prettier-ignore */ logger.culogger.debug(['Token under curor: %o', targetToken], { onlyVerbose: true, });

    return targetToken;
  }
  getTokenAtIndex(index: number) {
    const tokenizedInput = this.reTokenizeInput(
      this.vimState.getActiveLine().text
    );

    if (index < 0) {
      index = 0;
    } else if (index > tokenizedInput.length - 1) {
      index = tokenizedInput.length - 1;
    }

    const targetToken = tokenizedInput[index];

    return targetToken;
  }
  getNexToken() {
    const tokenizedInput = this.reTokenizeInput(
      this.vimState.getActiveLine().text
    );
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
    const tokenizedInput = this.reTokenizeInput(
      this.vimState.getActiveLine().text
    );

    let previousIndex = 0;
    const curCol = this.vimState.cursor.col;
    for (let index = 0; index < tokenizedInput.length; index++) {
      const token = tokenizedInput[index];
      const previousToken = tokenizedInput[index - 1];
      if (!previousToken) continue;

      const isPrevious = curCol <= token.start && curCol >= previousToken.end;
      if (!isPrevious) continue;

      previousIndex = index - 1;
      break;
    }
    const previousToken = tokenizedInput[previousIndex];

    return previousToken;
  }

  /** **** */
  /* Text */
  /** **** */
  indentRight(): VimStateClass {
    const { indentSize } = this.vimOptions;
    const text = this.vimState.getActiveLine().text;

    const numOfWhiteSpaceAtStart = getNumOfWhiteSpaceAtStart(text);

    let newCol = this.vimState.cursor.col;
    if (numOfWhiteSpaceAtStart === this.vimState.cursor.col) {
      newCol = newCol + indentSize;
    }
    this.vimState.cursor.col = newCol;

    const spaces = ' '.repeat(indentSize);
    const updatedInput = `${spaces}${text}`;
    this.vimState.updateActiveLine(updatedInput);
    this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  indentLeft(): VimStateClass {
    const { indentSize } = this.vimOptions;
    const text = this.vimState.getActiveLine().text;

    const numOfWhiteSpaceAtStart = getNumOfWhiteSpaceAtStart(text);

    let colsToIndentLeft;
    colsToIndentLeft = numOfWhiteSpaceAtStart % indentSize;
    if (colsToIndentLeft === 0) {
      colsToIndentLeft = indentSize;
    }

    const previousCol = this.vimState.cursor.col;
    const maybeNewCol = Math.max(numOfWhiteSpaceAtStart - colsToIndentLeft, 0);
    const newCol = previousCol < maybeNewCol ? previousCol : maybeNewCol;
    this.vimState.cursor.col = newCol;

    const updatedInput = text.substring(colsToIndentLeft);
    this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
    this.vimState.updateActiveLine(updatedInput);
    this.reTokenizeInput(updatedInput);

    return this.vimState;
  }
  delete(): VimStateClass {
    const updatedInput = replaceAt(
      this.vimState.getActiveLine().text,
      this.vimState.cursor.col,
      ''
    );

    this.vimState.updateActiveLine(updatedInput);

    return this.vimState;
  }
  replace(commandInput: string): VimStateClass {
    const text = this.vimState.getActiveLine().text;
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
    const currentLine = this.vimState.getActiveLine().text;
    const newLineIndex = this.vimState.cursor.line + 1;
    const tempLines = [...this.vimState.lines];
    const numOfWs = StringUtil.getLeadingWhitespaceNum(currentLine);
    tempLines.splice(newLineIndex, 0, { text: ' '.repeat(numOfWs) });
    this.vimState.cursor.col = numOfWs;
    // put cursor below
    this.vimState.cursor.line = this.vimState.cursor.line + 1;
    this.vimState.lines = tempLines;
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }

  /** Lines */
  deleteLine(): VimStateClass {
    const curLine = this.vimState.cursor.line;
    // /* prettier-ignore */ console.trace('>>>> _ >>>> ~ file: abstract-mode.ts ~ line 504 ~ curLine', curLine);
    this.vimState.lines.splice(curLine, 1);

    let newCol = 0;
    if (this.vimState.getPreviousLine()) {
      newCol = Math.max(0, this.vimState.getPreviousLine().text.length - 1);
    } else {
      newCol = 0;
    }
    this.vimState.cursor.col = newCol;

    this.vimState.cursor.line = Math.max(curLine - 1, 0);
    const activeLine = this.vimState.getActiveLine().text;
    this.vimState.updateActiveLine(activeLine ?? '');

    //
    this.vimState.deletedLinesIndeces = [curLine];

    return this.vimState;
  }

  joinLine(): VimStateClass {
    const prev = this.vimState.getPreviousLine().text;
    const active = this.vimState.getActiveLine().text;
    const joined = prev.concat(active);

    const prevCursor = this.vimState.cursor.line - 1;
    this.vimState.updateLine(prevCursor, joined);
    this.deleteLine();
    this.vimState.cursor.col = prev.length;

    return this.vimState;
  }

  toggleFold(): VimStateClass {
    const { foldMap, parentIndex } = toggleFold(
      this.vimState.cursor.line,
      this.vimState.lines,
      this.vimState.foldMap
    );
    this.vimState.cursor.line = parentIndex;

    this.vimState.foldMap = foldMap;
    return this.vimState;
  }

  copy(): VimStateClass {
    return this.vimState;
  }
  undo(): VimStateClass {
    return this.vimState;
  }
  redo(): VimStateClass {
    return this.vimState;
  }

  async paste(clipboardTextSplit: string[]): Promise<VimStateClass> {
    const line = this.vimState.getActiveLine();
    const col = this.vimState.cursor.col;

    let replaced = '';
    const updatedLines: VimLine[] = [];
    if (clipboardTextSplit.length === 1) {
      // insert normally at current line
      replaced = StringUtil.insert(line.text, col, clipboardTextSplit[0]);
      updatedLines.push({ ...line, text: replaced });
    } else if (clipboardTextSplit.length === 2) {
      const beforePaste = line.text.slice(0, col);
      const beforeWithPasted = beforePaste.concat(clipboardTextSplit[0]);
      const updatedBeforeLine: VimLine = { ...line, text: beforeWithPasted };
      const afterPaste = line.text.slice(col, line.text.length);
      const afterPasted = clipboardTextSplit[1].concat(afterPaste);
      const updatedAfterLine: VimLine = { ...line, text: afterPasted };
      // insert
      // and then split
      updatedLines.push(updatedBeforeLine);
      updatedLines.push(updatedAfterLine);
    } else {
      const [clipboardFirstLine, clipboardMiddleLines, clipboardLastLine] =
        ArrayUtils.splitFirstMiddleLast<string[]>(
          clipboardTextSplit
        ) as ThreeSplitType<string[]>;

      // for new lines, append at current line
      // acount for current line split at '\n' char from pasted
      const beforePaste = line.text.slice(0, col);
      const beforeWithPasted = beforePaste.concat(clipboardFirstLine);
      const updatedBeforeLine: VimLine = { ...line, text: beforeWithPasted };
      const afterPaste = line.text.slice(col, line.text.length);
      const afterPasted = clipboardLastLine.concat(afterPaste);
      const updatedAfterLine: VimLine = { ...line, text: afterPasted };
      // insert
      // and then split
      const otherPastedLines: VimLine[] = clipboardMiddleLines.map((text) => {
        return { text };
      });
      updatedLines.push(updatedBeforeLine);
      updatedLines.push(...otherPastedLines);
      updatedLines.push(updatedAfterLine);
    }

    const lines = [...this.vimState.lines];
    const curLine = this.vimState.cursor.line;

    const beforeText = [...lines.slice(0, curLine)];
    const afterText = [...lines.slice(curLine + 1, lines.length)];
    const withPastedText = [...beforeText, ...updatedLines, ...afterText];

    this.vimState.lines = withPastedText;

    return this.vimState;
  }

  nothing(): VimStateClass {
    return this.vimState;
  }
}

function getNumOfWhiteSpaceAtStart(text: string) {
  const whiteSpaceAtStartIndex = /\w/g.exec(text);
  let numOfWhiteSpaceAtStart = text.length;
  if (whiteSpaceAtStartIndex !== null) {
    numOfWhiteSpaceAtStart = whiteSpaceAtStartIndex.index;
  }
  return numOfWhiteSpaceAtStart;
}

export function isValidHorizontalPosition(
  cursorCol: number,
  activeInput: string
) {
  if (DebugService.debugAfterHit(3)) {
    // debugger;
  }
  if (cursorCol === activeInput.length + 1) return true;

  const isBigger = cursorCol > activeInput.length;
  /**
   * Should be > technically, but conceptionally, cursor and text index are off by one.
   */
  const isZero = cursorCol === 0;
  const result = !isBigger && !isZero;

  return result;
}

export function isValidVerticalPosition(line: number, lines: VimLine[]) {
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

  logger.culogger.debug(['Tokens: %o', tokens], { onlyVerbose: true });

  return tokens;
}
