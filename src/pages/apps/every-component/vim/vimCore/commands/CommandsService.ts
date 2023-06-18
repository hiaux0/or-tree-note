import { Logger } from '../../../../../../common/logging/logging';
import { inputContainsSequence } from '../../../../../../modules/string/string';
import {
  VIM_COMMAND,
  VimCommand,
} from '../../../../../../modules/vim/vim-commands-repository';
import {
  VimStateV2,
  FindPotentialCommandReturn,
  VimMode,
  KeyBindingModes,
  VimOptions,
} from '../../../../../../modules/vim/vim-types';
import { isModifierKey } from '../../../../../../modules/vim/vim-utils';
import { ESCAPE } from '../../../../../../resources/keybindings/app-keys';
import { commandsThatWaitForNextInput } from '../../../../../../resources/keybindings/key-bindings';
import { ShortcutService } from '../../../shortcuts/ShortcutService';

const logger = new Logger('CommandsService');

export class CommandsService {
  private potentialCommands: VimCommand[] = [];
  /** If a command did not trigger, save key */
  private queuedKeys: string[] = [];
  private readonly keyBindings: KeyBindingModes;

  constructor(vimOptions: VimOptions) {
    this.keyBindings = vimOptions.keyBindings;
  }

  public getCommandName(
    vimState: VimStateV2,
    input: string,
    modifiers: string[] = []
  ): VIM_COMMAND | undefined {
    let targetCommand: VimCommand;
    let potentialCommands: FindPotentialCommandReturn['potentialCommands'];

    try {
      /** Else, it "awaiting commands" like `t` will not function properly in insert mode. Can this be improved? */
      if (vimState.mode !== VimMode.INSERT) {
        ({ targetCommand, potentialCommands } = this.findPotentialCommand(
          vimState,
          input,
          modifiers
        ));
      }
    } catch (error) {
      /* prettier-ignore */ logger.culogger.debug(['Error: %s', error], { onlyVerbose: true }, (...r) => console.log(...r));
      // throw error;
    }

    //
    if (!targetCommand) {
      if (potentialCommands?.length) {
        /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {}, (...r) => console.log(...r));
      } else {
        /* prettier-ignore */ logger.culogger.debug(['No command for key: %s in Mode: %s', input, vimState.mode, ], { isError: true }, (...r) => console.error(...r));
      }

      return;
    }

    /* prettier-ignore */ logger.culogger.debug(['Command: %s', targetCommand.command], {}, (...r) => console.log(...r));

    //
    return targetCommand.command;
  }

  /**
   * @throws EmpytArrayException
   * sideeffect queuedKeys
   * sideeffect potentialCommands
   */
  private findPotentialCommand(
    vimState: VimStateV2,
    input: string,
    modifiers: string[] = []
  ): FindPotentialCommandReturn {
    //
    let targetKeyBinding: VimCommand[];
    if (input === ESCAPE) {
      this.emptyQueuedKeys();
      return {
        targetCommand: { key: '<Escape>', command: VIM_COMMAND['cancelAll'] },
        potentialCommands: [],
      };
    } else if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      targetKeyBinding = this.keyBindings[
        vimState.mode.toLowerCase() as keyof KeyBindingModes
      ] as VimCommand[];
    }

    //
    input = ShortcutService.ensureVimModifier(input);
    /* prettier-ignore */ logger.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
    let keySequence: string = '';
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join('').concat(input);
    } else if (
      ShortcutService.getSynonymModifier(this.keyBindings, input) ||
      modifiers.length
    ) {
      const synonymInput = ShortcutService.getSynonymModifier(
        this.keyBindings,
        input
      );

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
    /* prettier-ignore */ logger.culogger.debug(['keySequence: %s', keySequence], {}, (...r) => { return console.log(...r); });
    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], {}, (...r) => console.log(...r));
    const commandAwaitingNextInput = this.getCommandAwaitingNextInput(
      input,
      this.queuedKeys,
      this.potentialCommands
    );
    let targetCommand: VimCommand;
    /**
     * 'f' -> 'Shift' -> 'N'
     *        ^ ignore
     *                   ^ wait for
     */
    if (commandAwaitingNextInput) {
      if (isModifierKey(input)) {
        // do nothing
      } else if (commandAwaitingNextInput.targetCommand) {
        /** 2nd round: Ie. after pressing f, we arrived at the 2nd round, that handles the next input */
        targetCommand = commandAwaitingNextInput.targetCommand;
        this.emptyQueuedKeys();
      } else {
        this.potentialCommands = commandAwaitingNextInput.potentialCommands;
      }
    } else if (potentialCommands.length === 0) {
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

  private emptyQueuedKeys() {
    this.queuedKeys = [];
    this.potentialCommands = [];
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
  private getCommandAwaitingNextInput(
    input: string,
    queuedKeys: string[],
    potentialCommands: VimCommand[]
  ): FindPotentialCommandReturn | undefined {
    const keySequence = queuedKeys.join('').concat(input);
    const finalAwaitingCommand = commandsThatWaitForNextInput.find(
      // BUG?
      /**
       * 1. press <space>
       * 2. t
       * 3. Expect: <space>t
       * 4. But: t
       */
      (command) => command.key === keySequence
    );
    if (finalAwaitingCommand) {
      return {
        targetCommand: undefined,
        potentialCommands: [finalAwaitingCommand],
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
}
