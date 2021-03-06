import { cloneDeep } from 'lodash';

import { SPACE } from 'resources/keybindings/app.keys';
import keyBindingsJson from 'resources/keybindings/key-bindings';
import { Logger } from 'modules/debug/logger';

import {
  VimOptions,
  Cursor,
  QueueInputReturn,
  KeyBindingModes,
  VimExecutingMode,
  VimState,
  VimMode,
} from './vim.types';
import { VimCommandManager } from './vim-command-manager';
import { VimCommandNames } from './vim-commands-repository';

const logger = new Logger({ scope: 'Vim' });

export class VimError extends Error {}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

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
  private vimCommandManager: VimCommandManager;
  public vimState: VimState;

  constructor(
    private lines: string[],
    private cursor: Cursor = defaultCursor,
    private vimOptions?: VimOptions
  ) {
    const finalVimOptions = {
      ...defaultVimOptions,
      ...this.vimOptions,
    };
    const initialVimState: VimState = {
      text: this.lines[this.cursor.line],
      cursor: this.cursor,
      mode: VimMode.NORMAL
    };
    this.vimCommandManager = new VimCommandManager(
      this.lines,
      initialVimState,
      finalVimOptions
    );
    this.vimState = this.vimCommandManager.vimState;

    this.verifyValidCursorPosition();
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

  /** *************/
  /** Input Queue */
  /** *************/

  /** */
  queueInput(input: string): QueueInputReturn {
    logger.debug(['Received input: %s', input]);

    //
    let targetCommandName: VimCommandNames;
    try {
      targetCommandName = this.vimCommandManager.getCommandName(input);
    } catch {}

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
    } else {
      vimState = this.vimState;
    }

    //
    const result = {
      vimState: cloneDeep(vimState),
      targetCommand: targetCommandName,
      lines: [...this.lines],
    };

    logger.debug(['Result of input: %s is: %o', input, result], {
      onlyVerbose: true,
    });

    return result;
  }

  /** */
  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturn[] {
    let resultList: QueueInputReturn[] = [];
    let givenInputSequence;

    if (typeof inputSequence === 'string') {
      givenInputSequence = this.vimCommandManager.splitInputSequence(
        inputSequence
      );
    } else {
      givenInputSequence = inputSequence;
    }

    givenInputSequence.forEach((input) => {
      const subResult = this.queueInput(input);
      resultList.push(subResult);
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
}
