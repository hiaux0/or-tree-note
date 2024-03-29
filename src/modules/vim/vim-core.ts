import { Logger } from 'common/logging/logging';
import { cloneDeep } from 'lodash';
import { DebugService } from 'modules/debug/debugService';
import { SPACE } from 'resources/keybindings/app-keys';
import keyBindingsJson from 'resources/keybindings/key-bindings';

import { VimCommandManager } from './vim-command-manager';
import {
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
  VimLine,
} from './vim-types';

const logger = new Logger('VimCore');

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
export class VimCore {
  /**
   * TODO: remove state from the core?
   *   Have class outised the core handle it
   *   Idea: core just i/o
   */
  public vimState: VimStateClass;

  private readonly vimCommandManager: VimCommandManager;
  private readonly activeLine: string;

  /** ISSUE-xC83cN1d: remove lines and cursore, for vimOptions. (or take vimState from vimOptions) */
  constructor(
    private readonly lines: VimLine[],
    private readonly cursor: Cursor = defaultCursor,
    private readonly vimOptions?: VimOptions
  ) {
    const finalVimOptions = {
      ...defaultVimOptions,
      ...this.vimOptions,
    };
    const initialVimState = new VimStateClass(
      vimOptions.vimState ?? {
        cursor,
        lines,
      }
    );
    this.vimCommandManager = new VimCommandManager(
      initialVimState,
      finalVimOptions
    );
    this.vimState = initialVimState;

    this.verifyValidCursorPosition();
  }

  /** *************/
  /** Input Queue */
  /** *************/

  /**
   * For modifier keys, pass in, eg. <Escape>
   */
  async queueInput(
    input: string,
    modifiers?: string[]
  ): Promise<QueueInputReturn | undefined> {
    /* prettier-ignore */ logger.culogger.debug(['Mode: (%s) %s', this.vimState.mode], {}, (...r) => console.log(...r));
    this.vimState.snippet = undefined;
    const modifiersText = `${modifiers?.join('+ ')}`;
    /* prettier-ignore */ logger.culogger.debug(['Received input: (%s) %s', modifiersText, input], {}, (...r) => console.log(...r));

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
    DebugService.startDebugCollection(
      targetCommandName,
      input,
      cloneDeep(this.vimState)
    );

    let vimState: VimStateClass | undefined;

    // insert
    switch (targetCommandName) {
      /** ****** */
      /** Modes */
      /** ****** */
      case VIM_COMMAND['enterInsertMode']:
        vimState = this.vimCommandManager.enterInsertMode();
        break;
      case VIM_COMMAND['createNewLine']:
        this.vimCommandManager.enterInsertMode();
        vimState = await this.vimCommandManager.executeVimCommand(
          targetCommandName,
          input
        );
        // normal
        break;
      case VIM_COMMAND['enterNormalMode']:
        vimState = this.vimCommandManager.enterNormalMode();
        // visual
        break;
      case VIM_COMMAND['enterVisualMode']:
        vimState = this.vimCommandManager.enterVisualMode();
        break;
      case VIM_COMMAND['visualStartLineWise']:
        vimState = this.vimCommandManager.visualStartLineWise();
        break;

      /** ******** */
      /** Commands */
      /** ******** */
      case VIM_COMMAND['newLine']:
        await this.queueInputSequence('u^');
        break;
      case VIM_COMMAND['paste']: {
        const clipboardTextRaw = await navigator.clipboard.readText();
        const clipboardTextSplit = clipboardTextRaw.split('\n');
        vimState = await this.vimCommandManager.executeVimCommand(
          targetCommandName,
          clipboardTextSplit
        );
        break;
      }

      /** ******* */
      /** Default */
      /** ******* */
      default:
        vimState = await this.vimCommandManager.executeVimCommand(
          targetCommandName,
          input
        );
        break;
    }

    //
    if (vimState !== undefined) {
      this.vimCommandManager.setVimState(vimState);
      this.vimState = vimState;
      this.handleCommandThatChangesMode(targetCommandName);
    } else {
      vimState = this.vimState;
    }
    DebugService.endDebugCollection(this.vimState);

    //
    const result: QueueInputReturn = {
      vimState: cloneDeep(vimState),
      targetCommand: targetCommandName,
    };
    /* prettier-ignore */ logger.culogger.debug(['vimState: %o', vimState], {}, (...r) => console.log(...r));

    /**
     * Hack? Need to reset deleted lines for every new command,
     * else we will always delete, once a deleteIndex is present
     */
    this.vimState.deletedLinesIndeces = [];

    this.logAndVerifyQueueInputReturn(result, input);

    return result;
  }

  /** */
  async queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): Promise<QueueInputReturn[]> {
    const resultList: QueueInputReturn[] = [];
    let givenInputSequence: string[];

    if (typeof inputSequence === 'string') {
      givenInputSequence =
        this.vimCommandManager.splitInputSequence(inputSequence);
    } else {
      givenInputSequence = inputSequence;
    }

    await Promise.all(
      givenInputSequence.map(async (input) => {
        const subResult = await this.queueInput(input);
        if (subResult?.targetCommand !== undefined) {
          resultList.push(subResult);
        }
      })
    );

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
  enterVisualMode() {
    return this.vimCommandManager.enterVisualMode();
  }
  enterVisualLineMode() {
    return this.vimCommandManager.visualStartLineWise();
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
    } else if (cursorCol > this.lines[cursorLine].text.length) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.lines[cursorLine].text.length} columns, but cursor column is: ${cursorCol}`
      );
    }
  }

  private logAndVerifyQueueInputReturn(
    queueInputReturn: QueueInputReturn,
    input: string
  ) {
    if (queueInputReturn.vimState == null) return;

    const { cursor, lines } = queueInputReturn.vimState;
    const text = queueInputReturn.vimState.getActiveLine().text;
    if (lines[cursor.line] === undefined) {
      console.warn('bug: cursor line is -1');
      return;
      // debugger;
    }
    const actviveLine = lines[cursor.line].text;
    if (actviveLine !== text) {
      const errorMessage = 'Active line and vim state wrong.';
      const expected = `Expected: ${text}`;
      const received = `Received: ${actviveLine}`;
      throw new Error(`${errorMessage}\n${expected}\n${received}`);
    }

    /* prettier-ignore */ logger.culogger.debug(['Result of input: %s is: %o', input, queueInputReturn], { onlyVerbose: true, }, (...r) => console.log(...r));
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
