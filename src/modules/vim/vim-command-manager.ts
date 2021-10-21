import { groupBy } from 'lodash';
import { Logger } from 'modules/debug/logger';
import { inputContainsSequence } from 'modules/string/string';
import { SPECIAL_KEYS } from 'resources/keybindings/app.keys';

import { InsertMode } from './modes/insert-mode';
import { NormalMode } from './modes/normal-mode';
import { VisualMode } from './modes/visual-mode';
import { defaultVimOptions } from './vim';
import { VimCommandNames, VimCommand } from './vim-commands-repository';
import {
  VimState,
  FindPotentialCommandReturn,
  VimMode,
  QueueInputReturn,
  KeyBindingModes,
  Cursor,
  VimOptions,
} from './vim.types';

const logger = new Logger({ scope: 'VimCommandManager' });

/**
 * I know about the "manager" naming, but `VimCommand` interface also makes sense
 */
export class VimCommandManager {
  activeMode: VimMode = VimMode.NORMAL;
  private normalMode: NormalMode;
  private insertMode: InsertMode;
  private visualMode: VisualMode;

  /** Alias for vimOptions.keyBindings */
  private keyBindings: KeyBindingModes;

  private potentialCommands: VimCommand[];
  /** If a command did not trigger, save key */
  private queuedKeys: string[] = [];
  private cursor: Cursor;

  constructor(
    public lines: string[],
    public vimState: VimState,
    public vimOptions: VimOptions = defaultVimOptions
  ) {
    this.cursor = vimState.cursor;

    this.normalMode = new NormalMode(vimState, this.lines, this.vimOptions);
    this.insertMode = new InsertMode(vimState, this.lines, this.vimOptions);
    this.visualMode = new VisualMode(vimState, this.lines, this.vimOptions);

    this.keyBindings = this.vimOptions.keyBindings;
  }

  setVimState(vimState: VimState) {
    this.vimState = vimState;
  }

  /** *******/
  /** Modes */
  /** *******/

  enterInsertMode() {
    logger.debug(['Enter Insert mode']);
    this.activeMode = VimMode.INSERT;
    this.insertMode.reTokenizeInput(this.vimState?.text);
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }
  enterNormalMode() {
    logger.debug(['Enter Normal mode']);
    this.activeMode = VimMode.NORMAL;
    this.normalMode.reTokenizeInput(this.vimState?.text);
    this.vimState.mode = VimMode.NORMAL;
    //
    this.potentialCommands = [];
    this.queuedKeys = [];
    this.vimState.visualEndCursor = undefined;
    this.vimState.visualStartCursor = undefined;

    return this.vimState;
  }
  enterVisualMode() {
    logger.debug(['Enter Visual mode']);
    this.activeMode = VimMode.VISUAL;
    this.vimState.visualStartCursor = { ...this.vimState.cursor };
    this.vimState.visualEndCursor = {
      col: this.vimState.cursor.col,
      line: this.vimState.cursor.line,
    };
    this.vimState.mode = VimMode.VISUAL;

    return this.vimState;
  }
  getCurrentMode() {
    if (this.activeMode === VimMode.NORMAL) {
      return this.normalMode;
    } else if (this.activeMode === VimMode.INSERT) {
      return this.insertMode;
    } else if (this.activeMode === VimMode.VISUAL) {
      return this.visualMode;
    }
  }

  /** **********/
  /** Commands */
  /** **********/

  executeVimCommand(
    commandName: VimCommandNames,
    commandInput?: string
  ): VimState {
    const currentMode = this.getCurrentMode();
    try {
      const vimState = currentMode.executeCommand(commandName, commandInput);
      return vimState;
    } catch (error) {
      const previousState = this.vimState;
      return previousState;
    }
  }

  /**
   * @throws EmpytArrayException
   * @sideeffect queuedKeys
   * @sideeffect potentialCommands
   */
  findPotentialCommand(input: string): FindPotentialCommandReturn {
    //
    input = this.ensureVimModifier(input);

    logger.debug(['Finding potential command for: ', input]);

    //
    let targetKeyBinding: VimCommand[];
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
      //
    } else {
      targetKeyBinding = this.keyBindings[
        this.activeMode.toLowerCase()
      ] as VimCommand[];
    }

    //
    let keySequence: string;

    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join('').concat(input);
    } else if (this.getSynonymModifier(input)) {
      const synonymInput = this.getSynonymModifier(input);
      if (synonymInput) {
        keySequence = synonymInput;
      }
    } else {
      keySequence = input;
    }
    logger.debug(['keySequence: %s', keySequence], {
      onlyVerbose: true,
    });

    //
    let targetCommand;

    keySequence; /*?*/
    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });
    logger.debug(['potentialCommands: %o', potentialCommands], {
      onlyVerbose: true,
    });

    if (potentialCommands.length === 0) {
      this.emptyQueuedKeys();
      throw new Error('Empty Array');
    } else if (
      potentialCommands.length === 1 &&
      keySequence === potentialCommands[0].key
    ) {
      targetCommand = potentialCommands[0];
      this.emptyQueuedKeys();
    } else {
      this.queuedKeys.push(input);
      this.potentialCommands = potentialCommands;
    }

    //
    return { targetCommand, potentialCommands };
  }

  /** */
  getCommandName(input: string): VimCommandNames {
    let targetCommand;
    let potentialCommands: FindPotentialCommandReturn['potentialCommands'];

    try {
      ({ targetCommand, potentialCommands } = this.findPotentialCommand(input));
    } catch (error) {
      logger.debug(['Error: %s', error], { onlyVerbose: true });
      // throw error;
    }

    //
    if (!targetCommand) {
      if (this.activeMode === VimMode.INSERT) {
        /* prettier-ignore */ logger.debug(['Default to the command: type in Insert Mode'], { log: true, });
        return 'type';
      }

      if (potentialCommands?.length) {
        /* prettier-ignore */ logger.debug(['Awaiting potential commands: %o', potentialCommands]);
      } else {
        /* prettier-ignore */ logger.debug( [ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', input, this.activeMode, ], { isError: true });
      }

      return;
    }

    logger.debug(['Command: %s', targetCommand.command]);

    //
    return targetCommand.command;
  }

  emptyQueuedKeys() {
    this.queuedKeys = [];
    this.potentialCommands = [];
  }

  /** */
  ensureVimModifier(input: string) {
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      logger.debug(['Converted to vim modifier key: %s', asVimModifier], {
        onlyVerbose: true,
      });
      return asVimModifier;
    }
    return input;
  }

  getSynonymModifier(input: string) {
    const synonymInput = this.keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      logger.debug(['Found synonym: %s for %s', synonymInput, input]);
      return synonymInput;
    } else {
      return input;
    }
  }

  /** */
  splitInputSequence(inputSequence: string) {
    /**
     * 1st part: match char after > (positive lookbehind)
     * 2nd part: match < with char following (positive lookahead)
     *
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
     */
    const regex = /(?<=>).|<(?=.)/g;
    const splitByModifier = inputSequence
      .replace(regex, (match) => {
        return `,${match}`;
      })
      .split(',');

    const result = [];
    splitByModifier.forEach((splitCommands) => {
      if (splitCommands.includes('<')) {
        result.push(splitCommands);
      } else {
        splitCommands.split('').forEach((command) => {
          result.push(command);
        });
      }
    });

    return result;
  }
  /** */
  batchResults(resultList: QueueInputReturn[]): QueueInputReturn[] {
    const accumulatedResult = resultList.filter((result) => result.vimState);

    //
    function groupByCommand(input: any[]) {
      const grouped = groupBy(input, (commandResult) => {
        return commandResult.targetCommand;
      });

      const result = Object.values(grouped).map((commandOutputs) => {
        return commandOutputs[commandOutputs.length - 1];
      });

      return result;
    }

    return groupByCommand(accumulatedResult);
  }

  newLine(): VimState {
    const newLineMessage = '';
    const newLineCursorLine = this.vimState.cursor.line + 1;
    const currentMode = this.getCurrentMode();

    currentMode.reTokenizeInput(newLineMessage);
    this.lines.splice(newLineCursorLine, 0, newLineMessage);
    this.vimState.text = newLineMessage;
    this.vimState.cursor = {
      line: newLineCursorLine,
      col: 0,
    };

    return this.vimState;
  }
}
