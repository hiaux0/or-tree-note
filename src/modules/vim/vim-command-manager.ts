import { Logger } from 'common/logging/logging';
import { flatten, flattenDeep, groupBy } from 'lodash';
import { inputContainsSequence } from 'modules/string/string';
import { MODIFIERS_WORDS, SPECIAL_KEYS } from 'resources/keybindings/app.keys';
import { commandsThatWaitForNextInput } from 'resources/keybindings/key-bindings';

import { InsertMode } from './modes/insert-mode';
import { NormalMode } from './modes/normal-mode';
import { VisualMode } from './modes/visual-mode';
import { defaultVimOptions } from './vim';
import { VimCommandNames, VimCommand } from './vim-commands-repository';
import { VimStateClass } from './vim-state';
import {
  VimState,
  FindPotentialCommandReturn as PotentialCommandReturn,
  VimMode,
  QueueInputReturn,
  KeyBindingModes,
  Cursor,
  VimOptions,
} from './vim.types';

const logger = new Logger('VimCommandManager');

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

  constructor(
    public lines: string[],
    public vimState: VimStateClass,
    public vimOptions: VimOptions = defaultVimOptions
  ) {
    this.normalMode = new NormalMode(vimState, this.lines, this.vimOptions);
    this.insertMode = new InsertMode(vimState, this.lines, this.vimOptions);
    this.visualMode = new VisualMode(vimState, this.lines, this.vimOptions);

    this.keyBindings = this.vimOptions.keyBindings;
  }

  setVimState(vimState: VimStateClass) {
    this.vimState = vimState;
  }

  /** *******/
  /** Modes */
  /** *******/

  enterInsertMode() {
    logger.culogger.debug(['Enter Insert mode']);
    this.activeMode = VimMode.INSERT;
    this.insertMode.reTokenizeInput(this.vimState?.getActiveLine());
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }
  enterNormalMode() {
    logger.culogger.debug(['Enter Normal mode']);
    this.activeMode = VimMode.NORMAL;
    this.normalMode.reTokenizeInput(this.vimState?.getActiveLine());
    this.vimState.mode = VimMode.NORMAL;
    //
    this.potentialCommands = [];
    this.queuedKeys = [];
    this.vimState.visualEndCursor = undefined;
    this.vimState.visualStartCursor = undefined;

    return this.vimState;
  }
  enterVisualMode() {
    logger.culogger.debug(['Enter Visual mode']);
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
  ): VimStateClass {
    const currentMode = this.getCurrentMode();
    try {
      const vimState = currentMode.executeCommand(commandName, commandInput);
      return vimState;
    } catch (error) {
      /* prettier-ignore */ logger.log(`No Command found in mode >> ${currentMode.currentMode} <<`, { log: true, isError: true });
      const previousState = this.vimState;
      return previousState;
    }
  }

  /**
   * @throws EmpytArrayException
   * @sideeffect queuedKeys
   * @sideeffect potentialCommands
   */
  findPotentialCommand(input: string): PotentialCommandReturn {
    const commandAwaitingNextInput = getCommandAwaitingNextInput(
      input,
      this.potentialCommands
    );
    if (commandAwaitingNextInput) {
      this.potentialCommands = commandAwaitingNextInput.potentialCommands;
      return commandAwaitingNextInput;
    }

    //
    let targetKeyBinding: VimCommand[];
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      targetKeyBinding = this.keyBindings[
        this.activeMode.toLowerCase()
      ] as VimCommand[];
    }

    //
    input = this.ensureVimModifier(input);
    logger.culogger.debug(['Finding potential command for: ', input]);
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
    /* prettier-ignore */ logger.culogger.debug(['keySequence: %s', keySequence], { onlyVerbose: true, });

    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], { onlyVerbose: true, });

    let targetCommand;
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

    return { targetCommand, potentialCommands };
  }

  /** */
  getCommandName(input: string): VimCommandNames {
    let targetCommand;
    let potentialCommands: PotentialCommandReturn['potentialCommands'];

    try {
      ({ targetCommand, potentialCommands } = this.findPotentialCommand(input));
    } catch (error) {
      logger.culogger.debug(['Error: %s', error], { onlyVerbose: true });
      // throw error;
    }

    //
    if (!targetCommand) {
      if (this.activeMode === VimMode.INSERT) {
        /* prettier-ignore */ logger.culogger.debug(['Default to the command: type in Insert Mode'], { log: true, });
        return 'type';
      }

      if (potentialCommands?.length) {
        /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands]);
      } else {
        /* prettier-ignore */ logger.culogger.debug( [ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', input, this.activeMode, ], { isError: true });
      }

      return;
    }

    logger.culogger.debug(['Command: %s', targetCommand.command]);

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

      logger.culogger.debug(
        ['Converted to vim modifier key: %s', asVimModifier],
        {
          onlyVerbose: true,
        }
      );
      return asVimModifier;
    }
    return input;
  }

  getSynonymModifier(input: string) {
    const synonymInput = this.keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      logger.culogger.debug(['Found synonym: %s for %s', synonymInput, input]);
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

  newLine(): VimStateClass {
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentLineIndex = cursor.line;
    const newLineIndex = currentLineIndex + 1;
    const currentMode = this.getCurrentMode();

    const updatedCurrentLineText = text.substring(0, cursor.col);
    this.vimState.lines[currentLineIndex] = updatedCurrentLineText;
    // new line
    const newLineText = text.substring(cursor.col);
    const updatedLines = [...this.vimState.lines];
    updatedLines.splice(newLineIndex, 0, newLineText);
    updatedLines; /*?*/
    currentMode.reTokenizeInput(newLineText);
    this.vimState.updateActiveLine(newLineText);

    this.vimState.lines = updatedLines;
    this.vimState.cursor = {
      line: newLineIndex,
      col: 0,
    };

    return this.vimState;
  }
}

/**
 * @example
 *   input = t
 *   potentialCommands = []
 *   getCommandAwaitingNextInput() // {targetCommand: undefined, potentialCommands: { key: 't', command: 'toCharacterBefore' }}
 *
 *   input = 4 //
 *   potentialCommands = [{ key: 't', command: 'toCharacterBefore' }]
 *   getCommandAwaitingNextInput() // {targetCommand: potentialCommands[0], potentialCommands}
 */
function getCommandAwaitingNextInput(
  input: string,
  potentialCommands: VimCommand[]
): PotentialCommandReturn {
  const awaitingCommand = commandsThatWaitForNextInput.find(
    (command) => command.key === input
  );
  if (awaitingCommand) {
    return {
      targetCommand: undefined,
      potentialCommands: [awaitingCommand],
    };
  }

  if (potentialCommands.length === 1) {
    const isInputForAwaitingCommand = commandsThatWaitForNextInput.find(
      (command) => command.command === potentialCommands[0].command
    );

    return {
      targetCommand: isInputForAwaitingCommand,
      potentialCommands: [isInputForAwaitingCommand],
    };
  }
}

/**
 * @example
 * <Enter> <enter>
 */
function ignoreCaseForModifiers(key: string, keySequence: string) {
  const isIgnoreCase = keySequence.toLowerCase().includes(key.toLowerCase());
  return isIgnoreCase;
}
