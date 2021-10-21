import { cloneDeep } from 'lodash';
import { Logger } from 'modules/debug/logger';
import { SPACE } from 'resources/keybindings/app.keys';
import keyBindingsJson from 'resources/keybindings/key-bindings';

import { VimCommandManager } from './vim-command-manager';
import {
  VimCommandNames,
  VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE,
} from './vim-commands-repository';
import {
  VimOptions,
  Cursor,
  QueueInputReturn,
  KeyBindingModes,
  VimExecutingMode,
  VimState,
  VimMode,
} from './vim.types';

const logger = new Logger({ scope: 'Vim' });

export class VimError extends Error {}

const keyBindings = keyBindingsJson as unknown as KeyBindingModes;

export const vim = 'vim';

export const defaultVimOptions: VimOptions = {
  keyBindings,
  leader: SPACE,
  indentSize: 4,
};

const defaultCursor = {
  col: 0,
  line: 0,
};
/**
 * First iteration: All vim needs is
 * - the input
 * - the cursor location
 */
export class Vim {
  public vimState: VimState;

  private readonly vimCommandManager: VimCommandManager;
  private activeLine: string;

  constructor(
    private readonly lines: string[],
    private readonly cursor: Cursor = defaultCursor,
    private readonly vimOptions?: VimOptions
  ) {
    const finalVimOptions = {
      ...defaultVimOptions,
      ...this.vimOptions,
    };
    const initialVimState: VimState = {
      text: this.lines[this.cursor.line],
      cursor: this.cursor,
      mode: VimMode.NORMAL,
    };
    this.vimCommandManager = new VimCommandManager(
      this.lines,
      initialVimState,
      finalVimOptions
    );
    this.vimState = this.vimCommandManager.vimState;

    this.verifyValidCursorPosition();
  }

  /** *************/
  /** Input Queue */
  /** *************/

  /**
   * For modifier keys, pass in, eg. <Escape>
   */
  queueInput(input: string): QueueInputReturn | undefined {
    logger.debug(['Received input: %s', input]);

    //
    let targetCommandName: VimCommandNames;
    try {
      targetCommandName = this.vimCommandManager.getCommandName(input);
    } catch {}
    if (!targetCommandName) return;

    let vimState: VimState;
    if (targetCommandName === 'enterInsertMode') {
      vimState = this.vimCommandManager.enterInsertMode();
    } else if (targetCommandName === 'enterNormalMode') {
      vimState = this.vimCommandManager.enterNormalMode();
    } else if (targetCommandName === 'enterVisualMode') {
      vimState = this.vimCommandManager.enterVisualMode();
    } else if (targetCommandName === 'newLine') {
      vimState = this.vimCommandManager.newLine();
    } else {
      vimState = this.vimCommandManager.executeVimCommand(
        targetCommandName,
        input
      );
    }

    //
    if (vimState) {
      this.vimCommandManager.setVimState(vimState);
      this.vimState = vimState;
      this.handleCommandThatChangesMode(targetCommandName);
    } else {
      vimState = this.vimState;
    }

    //
    const result: QueueInputReturn = {
      vimState: cloneDeep(vimState),
      targetCommand: targetCommandName,
      lines: [...this.getUpdateActiveLine()],
    };

    this.logAndVerifyQueueInputReturn(result, input);
    /* prettier-ignore */ console.log('TCL: result', result)

    return result;
  }

  /** */
  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturn[] {
    const resultList: QueueInputReturn[] = [];
    let givenInputSequence;

    if (typeof inputSequence === 'string') {
      givenInputSequence =
        this.vimCommandManager.splitInputSequence(inputSequence);
    } else {
      givenInputSequence = inputSequence;
    }

    givenInputSequence.forEach((input) => {
      const subResult = this.queueInput(input);
      if (subResult?.targetCommand !== undefined) {
        resultList.push(subResult);
      }
    });

    if (vimExecutingMode === VimExecutingMode.INDIVIDUAL) {
      return resultList;
    }

    return this.vimCommandManager.batchResults(resultList);
  }

  getCurrentMode() {
    return this.vimCommandManager.getCurrentMode();
  }
  enterInsertMode() {
    return this.vimCommandManager.enterInsertMode();
  }
  enterNormalMode() {
    return this.vimCommandManager.enterNormalMode();
  }

  private getUpdateActiveLine() {
    const { line: lineIndex } = this.vimState.cursor;
    const activeLine = this.lines[lineIndex];
    this.setActiveLine(activeLine);
    this.lines[lineIndex] = this.vimState.text;

    return this.lines;
  }
  private setActiveLine(activeLine: string) {
    this.activeLine = activeLine;
  }
  private getActiveLine() {
    return this.activeLine;
  }

  private verifyValidCursorPosition() {
    const cursorCol = this.cursor.col;
    const cursorLine = this.cursor.line;
    if (cursorCol < 0) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Must not be negative, but column is ${cursorCol}`
      );
    } else if (cursorLine < 0) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Must not be negative, but line is ${cursorLine}`
      );
    } else if (this.lines[cursorLine] == undefined) {
      // == for null and undefined
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.lines.length} lines, but cursor line is: ${cursorLine}`
      );
    } else if (cursorCol > this.lines[cursorLine].length) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.lines[cursorLine].length} columns, but cursor column is: ${cursorCol}`
      );
    }
  }

  private logAndVerifyQueueInputReturn(
    queueInputReturn: QueueInputReturn,
    input: string
  ) {
    const { vimState } = queueInputReturn;
    const actviveLine = this.lines[vimState.cursor.line];

    if (actviveLine !== vimState.text) {
      const errorMessage = `Active line and vim state wrong.`;
      const expected = `Expected: ${vimState.text}`;
      const received = `Received: ${actviveLine}`;
      throw new Error(`${errorMessage}\n${expected}\n${received}`);
    }

    logger.debug(['Result of input: %s is: %o', input, queueInputReturn], {
      onlyVerbose: true,
    });
  }

  private handleCommandThatChangesMode(targetCommandName: string) {
    // Change to normal mode
    if (VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE.includes(targetCommandName)) {
      this.enterNormalMode();
      return true;
    }

    return false;
  }
}
