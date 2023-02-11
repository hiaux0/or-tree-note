import { Logger } from 'common/logging/logging';
import { groupBy, includes } from 'lodash';
import { inputContainsSequence } from 'modules/string/string';
import { SPECIAL_KEYS } from 'resources/keybindings/app-keys';
import {
  commandsThatWaitForNextInput,
  isAlt,
  isBackspace,
  isControl,
  isDelete,
  isEnter,
  isEscape,
  isShift,
  isSpace,
} from 'resources/keybindings/key-bindings';

import { InsertMode } from './modes/insert-mode';
import { NormalMode } from './modes/normal-mode';
import { VisualMode } from './modes/visual-mode';
import { defaultVimOptions } from './vim';
import {
  VimCommandNames,
  VimCommand,
  VIM_COMMAND,
} from './vim-commands-repository';
import { VimStateClass } from './vim-state';
import {
  FindPotentialCommandReturn as PotentialCommandReturn,
  VimMode,
  QueueInputReturn,
  KeyBindingModes,
  VimOptions,
} from './vim-types';

const logger = new Logger('VimCommandManager', {
  log: true,
  disableLogger: false,
});

/**
 * I know about the "manager" naming, but `VimCommand` interface also makes sense
 */
export class VimCommandManager {
  activeMode: VimMode = VimMode.NORMAL;
  private readonly normalMode: NormalMode;
  private readonly insertMode: InsertMode;
  private readonly visualMode: VisualMode;

  /** Alias for vimOptions.keyBindings */
  private readonly keyBindings: KeyBindingModes;

  private potentialCommands: VimCommand[] = [];
  /** If a command did not trigger, save key */
  private queuedKeys: string[] = [];

  constructor(
    public vimState: VimStateClass,
    public vimOptions: VimOptions = defaultVimOptions
  ) {
    this.normalMode = new NormalMode(vimState, this.vimOptions);
    this.insertMode = new InsertMode(vimState, this.vimOptions);
    this.visualMode = new VisualMode(vimState, this.vimOptions);

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
    } catch (_error) {
      const error = _error as Error;
      console.error(error);

      const previousState = this.vimState;
      return previousState;
    }
  }

  /**
   * @throws EmpytArrayException
   * sideeffect queuedKeys
   * sideeffect potentialCommands
   */
  findPotentialCommand(
    input: string,
    modifiers: string[] = []
  ): PotentialCommandReturn {
    const commandAwaitingNextInput = getCommandAwaitingNextInput(
      input,
      this.potentialCommands
    );
    const includes = this.includesPotentialCommands(commandAwaitingNextInput);
    // if (includes) {
    // this.potentialCommands = commandAwaitingNextInput.potentialCommands;
    // return commandAwaitingNextInput;
    // }

    //
    let targetKeyBinding: VimCommand[];
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      targetKeyBinding = this.keyBindings[
        this.activeMode.toLowerCase() as keyof KeyBindingModes
      ] as VimCommand[];
    }

    //
    input = this.ensureVimModifier(input);
    /* prettier-ignore */ logger.culogger.debug(['Finding potential command for: ', input], {log: true});
    let keySequence: string = '';
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join('').concat(input);
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-command-manager.ts ~ line 170 ~ keySequence', keySequence);
    } else if (this.getSynonymModifier(input) || modifiers.length) {
      const synonymInput = this.getSynonymModifier(input);

      if (modifiers.length) {
        keySequence += modifiers.join('');
        // Already included, then use the array
      }
      if (synonymInput) {
        keySequence += synonymInput;
        // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-command-manager.ts ~ line 175 ~ keySequence', keySequence);
      }
    } else {
      keySequence = input;
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-command-manager.ts ~ line 179 ~ keySequence', keySequence);
    }
    /* prettier-ignore */ logger.culogger.debug(['keySequence: %s', keySequence], { log: true});

    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], { log: true});

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

  private includesPotentialCommands(
    commandAwaitingNextInput: PotentialCommandReturn
  ) {
    const has = this.potentialCommands.find((command) => {
      const found = includes(
        commandAwaitingNextInput?.potentialCommands,
        command
      );
      return found;
    });
    return has;
  }

  /** */
  getCommandName(
    input: string,
    modifiers: string[] = []
  ): VIM_COMMAND | undefined {
    let targetCommand;
    let potentialCommands: PotentialCommandReturn['potentialCommands'];

    try {
      /** Else, it "awaiting commands" like `t` will not function properly in insert mode. Can this be improved? */
      if (!this.isInsertMode()) {
        ({ targetCommand, potentialCommands } = this.findPotentialCommand(
          input,
          modifiers
        ));
      }
    } catch (error) {
      logger.culogger.debug(['Error: %s', error], { onlyVerbose: true });
      // throw error;
    }

    //
    if (!targetCommand) {
      if (this.isInsertMode()) {
        if (isAlt(input)) {
          return; // todo
        } else if (isBackspace(input)) {
          return VIM_COMMAND.backspace;
        } else if (isControl(input)) {
          return; // todo
        } else if (isDelete(input)) {
          return;
        } else if (isEnter(input)) {
          return VIM_COMMAND.newLine;
        } else if (isEscape(input)) {
          return VIM_COMMAND.enterNormalMode;
        } else if (isShift(input)) {
          return; // todo
        } else if (isSpace(input)) {
          return VIM_COMMAND.space;
        }

        /* prettier-ignore */ logger.culogger.debug(['Default to the command: type in Insert Mode'], { log: true, });
        return VIM_COMMAND.type;
      }

      if (potentialCommands?.length) {
        /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {log: false});
      } else {
        /* prettier-ignore */ logger.culogger.debug([ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', input, this.activeMode, ], { isError: true, log: true });
      }

      return;
    }

    logger.culogger.debug(['Command: %s', targetCommand.command]);

    //
    return targetCommand.command;
  }

  private isInsertMode() {
    return this.activeMode === VimMode.INSERT;
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

    const result: string[] = [];
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
    function groupByCommand(input: QueueInputReturn[]) {
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

  /** TODO: newline bug */
  newLine(): VimStateClass {
    this.vimState; /* ? */
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine();
    const currentLineIndex = cursor.line;
    const newLineIndex = currentLineIndex + 1;
    const currentMode = this.getCurrentMode();

    const updatedCurrentLineText = text.substring(0, cursor.col);
    this.vimState.lines; /* ? */
    this.vimState.lines[currentLineIndex] = updatedCurrentLineText;
    // this.vimState.lines; /* ? */
    // new line
    const newLineText = text.substring(cursor.col);
    const updatedLines = [...this.vimState.lines];
    // updatedLines; /* ? */
    updatedLines.splice(newLineIndex, 0, newLineText);
    updatedLines; /* ? */
    // updatedLines; /* ? */
    currentMode.reTokenizeInput(newLineText);
    // this.vimState.lines; /* ? */
    // this.vimState.updateActiveLine(newLineText);
    // this.vimState.lines; /* ? */

    this.vimState.lines = updatedLines;
    this.vimState.lines; /* ? */
    this.vimState.cursor = {
      line: newLineIndex,
      col: 0,
    };
    this.vimState.lines; /* ? */

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
): PotentialCommandReturn | undefined {
  const awaitingCommand = commandsThatWaitForNextInput.find(
    // BUG?
    /**
     * 1. press <space>
     * 2. t
     * 3. Expect: <space>t
     * 4. But: t
     */
    (command) => command.key === input
  );
  if (awaitingCommand) {
    return {
      targetCommand: undefined,
      potentialCommands: [awaitingCommand],
    };
  }

  if (potentialCommands.length !== 1) return;
  const isInputForAwaitingCommand = commandsThatWaitForNextInput.find(
    (command) => command.command === potentialCommands[0].command
  );
  if (!isInputForAwaitingCommand) return;

  return {
    targetCommand: isInputForAwaitingCommand,
    potentialCommands: [isInputForAwaitingCommand],
  };
}

/**
 * @example
 * <Enter> <enter>
 */
export function ignoreCaseForModifiers(key: string, keySequence: string) {
  const isIgnoreCase = keySequence.toLowerCase().includes(key.toLowerCase());
  return isIgnoreCase;
}
