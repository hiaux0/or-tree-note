import { VimCommandNames, VimCommand, SynonymKey } from "./vim-commands";
import { filterStringByCharSequence } from "modules/string/string";
import { Logger } from "./../debug/logger";
import { NormalMode } from "modules/vim/modes/normal-mode";
import { InsertMode } from "modules/vim/modes/insert-mode";
import { InsertTextModeKeybindings } from "./modes/insert-mode-commands";
import keyBindingsJson from "../../resources/keybindings/key-bindings";
import { cloneDeep, groupBy } from "lodash";
import { SPECIAL_KEYS } from "resources/keybindings/app.keys";

const logger = new Logger({ scope: "Vim" });

export interface KeyBindingModes {
  normal: VimCommand[];
  insert: InsertTextModeKeybindings[];
  synonyms: SynonymKey;
}

export enum VimExecutingMode {
  "INDIVIDUAL" = "INDIVIDUAL",
  "BATCH" = "BATCH",
}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

export const vim = "vim";

/**
 * Given a string 'Hello, World'
 * And I'm in normal mode
 * When I type "l"
 * Then the cursor should move one right
 */

interface FindPotentialCommandReturn {
  targetCommand: VimCommand;
  potentialCommands: VimCommand[];
}

export type VimState = {
  cursor?: Cursor;
  text?: string;
};

export interface QueueInputReturn {
  vimState: VimState | null;
  targetCommand: VimCommandNames;
  wholeInput: string[];
}

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
}
export interface VimOptions {
  keyBindings: KeyBindingModes;
}

const defaultVimOptions: VimOptions = {
  keyBindings,
};

/**
 * First iteration: All vim needs is
 * - the input
 * - the cursor location
 */
export class Vim {
  activeMode: VimMode = VimMode.NORMAL;
  normalMode: NormalMode;
  insertMode: InsertMode;

  /** Alias for vimOptions.keyBindings */
  keyBindings: KeyBindingModes;

  potentialCommands: VimCommand[];
  /** If a command did not trigger, save key */
  queuedKeys: string[] = [];
  vimState: VimState;

  constructor(
    public wholeInput: string[],
    public cursor: Cursor = { line: 0, col: 0 },
    public vimOptions: VimOptions = defaultVimOptions
  ) {
    const activeInput = wholeInput[cursor.line];
    const vimState: VimState = {
      text: activeInput,
      cursor,
    };

    this.normalMode = new NormalMode(vimState, this.wholeInput);
    this.insertMode = new InsertMode(vimState, this.wholeInput);

    this.keyBindings = vimOptions.keyBindings;

    this.verifyValidCursorPosition();
  }

  verifyValidCursorPosition() {
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
    } else if (!this.wholeInput[cursorLine]) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.wholeInput.length} lines, but cursor line is: ${cursorLine}`
      );
    } else if (cursorCol > this.wholeInput[cursorLine].length) {
      throw new Error(
        `[ILLEGAL]: Cursor out of bound: Your input has ${this.wholeInput[cursorLine].length} columns, but cursor column is: ${cursorCol}`
      );
    }
  }

  /** *******/
  /** Modes */
  /** *******/

  enterInsertTextMode() {
    logger.debug(["Enter Insert mode"]);
    this.activeMode = VimMode.INSERT;
  }
  enterNormalTextMode() {
    logger.debug(["Enter Normal mode"]);
    this.activeMode = VimMode.NORMAL;
  }
  getCurrentMode() {
    if (this.activeMode === VimMode.NORMAL) {
      return this.normalMode;
    } else if (this.activeMode === VimMode.INSERT) {
      return this.insertMode;
    }
  }

  /** **********/
  /** Commands */
  /** **********/

  executeCommand<CommandType = any>(
    commandName: VimCommandNames,
    commandInput?: string
  ): VimState {
    const currentMode = this.getCurrentMode();
    const vimState = currentMode.executeCommand(
      commandName,
      commandInput
    ) as CommandType;
    vimState; /*?*/
    return cloneDeep(vimState);
  }

  /**
   * @throws EmpytArrayException
   * @sideeffect queuedKeys
   * @sideeffect potentialCommands
   */
  findPotentialCommand(input: string): FindPotentialCommandReturn {
    //
    input = this.ensureVimModifier(input);

    //
    let targetKeyBinding;

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
      keySequence = this.queuedKeys.join("").concat(input);
    } else if (this.getSynonymModifier(input)) {
      const synonymInput = this.getSynonymModifier(input);
      if (synonymInput) {
        keySequence = synonymInput;
      }
    } else {
      keySequence = input;
    }
    logger.debug(["keySequence: %s", keySequence], {
      onlyVerbose: true,
    });

    //
    let targetCommand;

    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      const result = filterStringByCharSequence(keyBinding.key, keySequence);
      return result;
    });
    logger.debug(["potentialCommands: %o", potentialCommands], {
      onlyVerbose: true,
    });

    if (potentialCommands.length === 0) {
      this.emptyQueuedKeys();
      throw new Error("Empty Array");
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
    let potentialCommands: FindPotentialCommandReturn["potentialCommands"];

    try {
      ({ targetCommand, potentialCommands } = this.findPotentialCommand(input));
    } catch (error) {
      logger.debug(["Error: %s", error], { onlyVerbose: true });
    }

    //
    if (!targetCommand) {
      if (this.activeMode === VimMode.INSERT) {
        logger.debug(["Default to the command: type in Insert Mode"], {
          log: true,
        });
        return "type";
      }

      if (potentialCommands?.length) {
        logger.debug(["Awaiting potential commands: %o", potentialCommands]);
      } else {
        logger.debug(
          [
            "No command for key: %s in Mode: %s ((vim.ts-getCommandName))",
            input,
            this.activeMode,
          ],
          { isError: true }
        );
      }

      return;
    }

    logger.debug(["Command: %s", targetCommand.command]);

    //
    return targetCommand.command;
  }

  emptyQueuedKeys() {
    this.queuedKeys = [];
    this.potentialCommands = [];
  }

  /** *************/
  /** Input Queue */
  /** *************/

  /** */
  queueInput(input: string): QueueInputReturn {
    logger.debug(["Received input: %s", input], { isOnlyGroup: true });

    //
    const targetCommandName = this.getCommandName(input);

    if (targetCommandName === "enterInsertTextMode") {
      this.enterInsertTextMode();
      return {
        vimState: null,
        targetCommand: targetCommandName,
        wholeInput: this.wholeInput,
      };
    } else if (targetCommandName === "enterNormalTextMode") {
      this.enterNormalTextMode();
      return {
        vimState: null,
        targetCommand: targetCommandName,
        wholeInput: this.wholeInput,
      };
    }

    //
    const vimState = this.executeCommand(targetCommandName, input);
    this.setVimState(vimState);

    //
    const result = {
      vimState,
      targetCommand: targetCommandName,
      wholeInput: this.wholeInput,
    };

    logger.debug(["Result of input: %s is: %o", input, result], {
      onlyVerbose: true,
    });

    return result;
  }
  setVimState(vimState: VimState) {
    this.vimState = vimState;
  }
  /** */
  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturn[] {
    let resultList: QueueInputReturn[] = [];
    let givenInputSequence;

    if (typeof inputSequence === "string") {
      givenInputSequence = this.splitInputSequence(inputSequence);
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

    return this.batchResults(resultList);
  }

  /** */
  ensureVimModifier(input: string) {
    SPECIAL_KEYS;
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      logger.debug(["Converted to vim modifier key: %s", asVimModifier], {
        onlyVerbose: true,
      });
      return asVimModifier;
    }
    return input;
  }

  getSynonymModifier(input: string) {
    const synonymInput = this.keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      logger.debug(["Found synonym: %s for %s", synonymInput, input]);
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
    let splitByModifier = inputSequence
      .replace(regex, (match) => {
        return `,${match}`;
      })
      .split(",");

    let result = [];
    splitByModifier.forEach((splitCommands) => {
      if (splitCommands.includes("<")) {
        result.push(splitCommands);
      } else {
        splitCommands.split("").forEach((command) => {
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
}
