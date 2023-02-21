import { cloneDeep } from 'lodash';
import { Logger } from 'modules/debug/logger';
import { SPACE } from 'resources/keybindings/app-keys';
import keyBindingsJson from 'resources/keybindings/key-bindings';

import { VimCommandManager } from './vim-command-manager';
import {
  VimCommandNames,
  VIM_COMMAND,
  VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE,
} from './vim-commands-repository';
import { VimStateClass } from './vim-state';
import {
  VimOptions,
  Cursor,
  QueueInputReturn,
  KeyBindingModes,
  VimExecutingMode,
} from './vim-types';

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
  public vimState: VimStateClass;

  private readonly vimCommandManager: VimCommandManager;
  private readonly activeLine: string;

  constructor(
    private readonly lines: string[],
    private readonly cursor: Cursor = defaultCursor,
    private readonly vimOptions?: VimOptions
  ) {
    const finalVimOptions = {
      ...defaultVimOptions,
      ...this.vimOptions,
    };
    const initialVimState = new VimStateClass(cursor, lines);
    this.vimCommandManager = new VimCommandManager(
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
  queueInput(
    input: string,
    modifiers?: string[]
  ): QueueInputReturn | undefined {
    logger.debug(['Received input: %s', input], { log: true });

    //
    let targetCommandName: VIM_COMMAND | undefined;
    try {
      targetCommandName = this.vimCommandManager.getCommandName(
        input,
        modifiers
      );
    } catch (_error) {
      void 0;
    }
    if (!targetCommandName) return;
    logger.debug(['targetCommandName: %s', targetCommandName], { log: true });

    let vimState: VimStateClass | undefined;
    if (targetCommandName === VIM_COMMAND['enterInsertMode']) {
      vimState = this.vimCommandManager.enterInsertMode();
    } else if (targetCommandName === VIM_COMMAND['enterNormalMode']) {
      vimState = this.vimCommandManager.enterNormalMode();
    } else if (targetCommandName === VIM_COMMAND['enterVisualMode']) {
      vimState = this.vimCommandManager.enterVisualMode();
    } else if (targetCommandName === VIM_COMMAND['newLine']) {
      vimState = this.vimCommandManager.newLine();
    } else {
      vimState = this.vimCommandManager.executeVimCommand(
        targetCommandName,
        input
      );
    }

    //
    if (vimState !== undefined) {
      this.vimCommandManager.setVimState(vimState);
      this.vimState.lines; /* ? */
      this.vimState = vimState;
      this.vimState.lines; /* ? */
      this.handleCommandThatChangesMode(targetCommandName);

      vimState.commandName = targetCommandName;
    } else {
      vimState = this.vimState;
    }

    //
    if (targetCommandName !== VIM_COMMAND['deleteLine']) {
      vimState.deletedLinesIndeces = []; /* ? */
    }

    //
    const result: QueueInputReturn = {
      vimState: cloneDeep(vimState),
      targetCommand: targetCommandName,
      lines: [...this.vimState.lines],
    };
    logger.debug(['vimState: %o', vimState], { log: true });

    this.logAndVerifyQueueInputReturn(result, input);

    return result;
  }

  /** */
  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturn[] {
    const resultList: QueueInputReturn[] = [];
    let givenInputSequence: string[];

    if (typeof inputSequence === 'string') {
      givenInputSequence =
        this.vimCommandManager.splitInputSequence(inputSequence);
    } else {
      givenInputSequence = inputSequence;
    }

    givenInputSequence.forEach((input) => {
      if (input === 'u') {
        // input; /* ? */
      }
      const subResult = this.queueInput(input);
      if (subResult?.targetCommand !== undefined) {
        if (input === 'u') {
          // subResult; /* ? */
        }
        resultList.push(subResult);
      }
    });

    if (vimExecutingMode === VimExecutingMode.INDIVIDUAL) {
      // resultList; /* ? */
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
  enterVisualMode() {
    return this.vimCommandManager.enterVisualMode();
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
    } else if (this.lines[cursorLine] == null) {
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
    if (queueInputReturn.vimState == null) return;

    const { cursor, lines } = queueInputReturn.vimState;
    const text = queueInputReturn.vimState.getActiveLine();
    const actviveLine = lines[cursor.line];

    if (actviveLine !== text) {
      const errorMessage = 'Active line and vim state wrong.';
      const expected = `Expected: ${text}`;
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
