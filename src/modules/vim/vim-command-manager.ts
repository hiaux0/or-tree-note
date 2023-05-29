import { Logger } from 'common/logging/logging';
import { groupBy, includes } from 'lodash';
import { inputContainsSequence } from 'modules/string/string';
import { SPECIAL_KEYS } from 'resources/keybindings/app-keys';
import {
  commandsThatWaitForNextInput,
  cursorNormalAndInsert,
  isAlt,
  isArrowDown,
  isArrowLeft,
  isArrowRight,
  isArrowUp,
  isBackspace,
  isControl,
  isDelete,
  isEnter,
  isEscape,
  isOs,
  isShift,
  isSpace,
  isTab,
} from 'resources/keybindings/key-bindings';

import { InsertMode } from './modes/insert-mode';
import { NormalMode } from './modes/normal-mode';
import { VisualLineMode } from './modes/visual-line-mode';
import { VisualMode } from './modes/visual-mode';
import {
  VimCommandNames,
  VimCommand,
  VIM_COMMAND,
} from './vim-commands-repository';
import { defaultVimOptions } from './vim-core';
import { VimStateClass } from './vim-state';
import {
  FindPotentialCommandReturn as PotentialCommandReturn,
  VimMode,
  QueueInputReturn,
  KeyBindingModes,
  VimOptions,
} from './vim-types';

const logger = new Logger('VimCommandManager');

/**
 * I know about the "manager" naming, but `VimCommand` interface also makes sense
 */
export class VimCommandManager {
  activeMode: VimMode = VimMode.NORMAL;
  private readonly normalMode: NormalMode;
  private readonly insertMode: InsertMode;
  private readonly visualMode: VisualMode;
  private readonly visualLineMode: VisualLineMode;

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
    this.visualLineMode = new VisualLineMode(vimState, this.vimOptions);

    this.keyBindings = this.vimOptions.keyBindings;
  }

  setVimState(vimState: VimStateClass) {
    this.vimState = vimState;
  }

  /** *******/
  /** Modes */
  /** *******/

  enterInsertMode() {
    /* prettier-ignore */ logger.culogger.debug(['Enter Insert mode'], {}, (...r) => console.log(...r));
    this.activeMode = VimMode.INSERT;
    this.insertMode.reTokenizeInput(this.vimState?.getActiveLine().text);
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }
  enterNormalMode() {
    logger.culogger.debug(['Enter Normal mode'], {}, (...r) =>
      console.log(...r)
    );

    const beforeMode = this.activeMode;
    if (beforeMode === VimMode.INSERT) {
      this.vimState.cursor.col = this.normalMode.cursorLeft().cursor.col;
    }

    this.activeMode = VimMode.NORMAL;
    this.normalMode.reTokenizeInput(this.vimState?.getActiveLine().text);
    this.vimState.mode = VimMode.NORMAL;
    //
    this.potentialCommands = [];
    this.queuedKeys = [];
    this.vimState.visualEndCursor = undefined;
    this.vimState.visualStartCursor = undefined;

    return this.vimState;
  }
  enterVisualMode() {
    logger.culogger.debug(['Enter Visual mode'], {}, (...r) =>
      console.log(...r)
    );
    this.activeMode = VimMode.VISUAL;
    this.vimState.visualStartCursor = {
      col: this.vimState.cursor.col,
      line: this.vimState.cursor.line,
    };
    this.vimState.visualEndCursor = {
      col: this.vimState.cursor.col,
      line: this.vimState.cursor.line,
    };
    this.vimState.mode = VimMode.VISUAL;

    return this.vimState;
  }
  visualStartLineWise() {
    logger.culogger.debug(['Enter Visual Line mode'], {}, (...r) =>
      console.log(...r)
    );
    this.activeMode = VimMode.VISUALLINE;
    this.vimState.visualStartCursor = {
      col: 0,
      line: this.vimState.cursor.line,
    };
    this.vimState.visualEndCursor = {
      col: this.vimState.getActiveLine().text.length,
      line: this.vimState.cursor.line,
    };
    this.vimState.mode = VimMode.VISUALLINE;

    return this.vimState;
  }

  getCurrentMode() {
    if (this.activeMode === VimMode.NORMAL) {
      return this.normalMode;
    } else if (this.activeMode === VimMode.INSERT) {
      return this.insertMode;
    } else if (this.activeMode === VimMode.VISUAL) {
      return this.visualMode;
    } else if (this.activeMode === VimMode.VISUALLINE) {
      return this.visualLineMode;
    }
  }

  /** **********/
  /** Commands */
  /** **********/

  async executeVimCommand(
    commandName: VimCommandNames,
    commandInput?: string
  ): Promise<VimStateClass> {
    const currentMode = this.getCurrentMode();
    try {
      const vimState = await currentMode.executeCommand(
        commandName,
        commandInput
      );
      if (vimState !== undefined) {
        if (vimState.snippet) {
          vimState.commandName = VIM_COMMAND.snippet;
        } else {
          vimState.commandName = commandName;
        }
      }

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
      this.queuedKeys,
      this.potentialCommands
    );
    const includes = this.includesPotentialCommands(commandAwaitingNextInput);
    // if (includes) {
    if (commandAwaitingNextInput !== undefined) {
      if (this.potentialCommands.length === 0) {
        // /* prettier-ignore */ console.log('>>>> a.1 >>>> ~ file: vim-command-manager.ts ~ line 161 ~ this.potentialCommands', this.potentialCommands);
        this.potentialCommands = commandAwaitingNextInput.potentialCommands;
      } else if (this.potentialCommands.length === 1) {
        // /* prettier-ignore */ console.log('>>>> a.2 >>>> ~ file: vim-command-manager.ts ~ line 161 ~ this.potentialCommands', this.potentialCommands);
        this.potentialCommands = [];
      }
      return commandAwaitingNextInput;
    }

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
    /* prettier-ignore */ logger.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
    let keySequence: string = '';
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join('').concat(input);
    } else if (this.getSynonymModifier(input) || modifiers.length) {
      const synonymInput = this.getSynonymModifier(input);

      if (modifiers.length) {
        keySequence += modifiers.join('');
        // Already included, then use the array
      }
      if (synonymInput) {
        keySequence += synonymInput;
      }
    } else {
      keySequence = input;
    }
    /* prettier-ignore */ logger.culogger.debug(['keySequence: %s', keySequence], {}, (...r) => console.log(...r));

    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], {}, (...r) => console.log(...r));

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
  ): VimCommand | undefined {
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
      logger.culogger.debug(
        ['Error: %s', error],
        { onlyVerbose: true },
        (...r) => console.log(...r)
      );
      // throw error;
    }

    //
    if (!targetCommand) {
      if (this.isInsertMode()) {
        if (isAlt(input)) {
          return; // todo
        } else if (isArrowUp(input)) {
          return; // todo
        } else if (isArrowDown(input)) {
          return; // todo
        } else if (isArrowLeft(input)) {
          return; // todo
        } else if (isArrowRight(input)) {
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
        } else if (isOs(input)) {
          return;
        } else if (isShift(input)) {
          return; // todo
        } else if (isSpace(input)) {
          return VIM_COMMAND.space;
        } else if (isTab(input)) {
          return VIM_COMMAND.indentRight;
        } else if (isCommonCommand(input, modifiers) != null) {
          const targetCommand = isCommonCommand(input, modifiers);
          return VIM_COMMAND[targetCommand.command];
        }

        /* prettier-ignore */ logger.culogger.debug(['Default to the command: type in Insert Mode'], {}, (...r) => console.log(...r));
        return VIM_COMMAND.type;
      }

      if (potentialCommands?.length) {
        /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {}, (...r) => console.log(...r));
      } else {
        /* prettier-ignore */ logger.culogger.debug([ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', input, this.activeMode, ], { isError: true }, (...r) => console.log(...r));
      }

      return;
    }

    logger.culogger.debug(['Command: %s', targetCommand.command], {}, (...r) =>
      console.log(...r)
    );

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

      /* prettier-ignore */ logger.culogger.debug(['Converted to vim modifier key: %s', asVimModifier], { onlyVerbose: true, }, (...r) => console.log(...r));
      return asVimModifier;
    }
    return input;
  }

  getSynonymModifier(input: string) {
    const synonymInput = this.keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      logger.culogger.debug(
        ['Found synonym: %s for %s', synonymInput, input],
        {},
        (...r) => console.log(...r)
      );
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
    const { cursor } = this.vimState;
    const text = this.vimState.getActiveLine().text;
    const currentLineIndex = cursor.line;
    const newLineIndex = currentLineIndex + 1;
    const currentMode = this.getCurrentMode();

    const updatedCurrentLineText = { text: text.substring(0, cursor.col) };
    this.vimState.lines[currentLineIndex] = updatedCurrentLineText;
    // this.vimState.lines; /* ? */
    // new line
    const newLineText = text.substring(cursor.col);
    const updatedLines = [...this.vimState.lines];
    // updatedLines; /* ? */
    updatedLines.splice(newLineIndex, 0, { text: newLineText });
    // updatedLines; /* ? */
    currentMode.reTokenizeInput(newLineText);
    // this.vimState.lines; /* ? */
    // this.vimState.updateActiveLine(newLineText);
    // this.vimState.lines; /* ? */

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
  queuedKeys: string[],
  potentialCommands: VimCommand[]
): PotentialCommandReturn | undefined {
  const keySequence = queuedKeys.join('').concat(input);
  const awaitingCommand = commandsThatWaitForNextInput.find(
    // BUG?
    /**
     * 1. press <space>
     * 2. t
     * 3. Expect: <space>t
     * 4. But: t
     */
    (command) => command.key === keySequence
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

  const result = {
    targetCommand: isInputForAwaitingCommand,
    potentialCommands: [isInputForAwaitingCommand],
  };
  return result;
}

/**
 * @example
 * <Enter> <enter>
 */
export function ignoreCaseForModifiers(key: string, keySequence: string) {
  const isIgnoreCase = keySequence.toLowerCase().includes(key.toLowerCase());
  return isIgnoreCase;
}

function isCommonCommand(input: string, modifiers: string[]): VimCommand {
  const composite = `${modifiers.join('')}${input}`;
  const targetCommand = cursorNormalAndInsert.find((command) => {
    return command.key === composite;
  });

  return targetCommand;
}
