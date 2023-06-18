import { cloneDeep, groupBy } from 'lodash';

import { Logger } from '../../../../../../common/logging/logging';
import { NormalMode } from '../../../../../../modules/vim/modes/normal-mode';
import { VIM_COMMAND } from '../../../../../../modules/vim/vim-commands-repository';
import { VimStateClass } from '../../../../../../modules/vim/vim-state';
import {
  VimStateV2,
  VimMode,
  VimOptions,
  QueueInputReturnv2,
} from '../../../../../../modules/vim/vim-types';
import { CommandsService } from '../commands/CommandsService';

const logger = new Logger('VimCommandManagerV2');

/**
 * - Given input, find command, execute it, and provide result
 */
export class VimCommandManagerV2 {
  private readonly commandsService: CommandsService;
  private readonly normalMode: NormalMode;

  constructor(vimState: VimStateV2, private readonly vimOptions: VimOptions) {
    this.commandsService = new CommandsService(vimOptions);

    this.normalMode = new NormalMode(
      new VimStateClass(vimState),
      this.vimOptions
    );
  }

  public async executeCommand(
    vimState: VimStateV2,
    input: string,
    modifiers: string[]
  ): Promise<QueueInputReturnv2> {
    /* prettier-ignore */ logger.culogger.debug(['Mode: (%s) %s', vimState.mode], {}, (...r) => console.log(...r));
    vimState.snippet = undefined;
    const modifiersText = `${modifiers?.join('+ ')}`;
    /* prettier-ignore */ logger.culogger.debug(['Received input: (%s) %s', modifiersText, input], {}, (...r) => console.log(...r));

    //
    let targetCommandName: VIM_COMMAND | undefined;
    try {
      targetCommandName = this.commandsService.getCommandName(
        vimState,
        input,
        modifiers
      );
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimCommandManagerV2.ts:40 ~ targetCommandName:', targetCommandName);
    } catch (_error) {
      void 0;
    }
    if (!targetCommandName) return;

    const result = await this.executeVimCommand(
      vimState,
      targetCommandName,
      input
    );

    return result;
  }

  private async executeVimCommand(
    vimState: VimStateV2,
    commandName: VIM_COMMAND,
    commandInput?: unknown
  ): Promise<QueueInputReturnv2> {
    const currentMode = this.getCurrentMode(vimState);
    let targetVimState = vimState;
    try {
      const newVimState = await currentMode.executeCommand(
        commandName,
        commandInput
      );
      if (newVimState !== undefined) {
        if (newVimState.snippet) {
          newVimState.commandName = VIM_COMMAND.snippet;
        } else {
          newVimState.commandName = commandName;
        }
      }
      targetVimState = newVimState;
    } catch (_error) {
      const error = _error as Error;
      console.error(error);
    }

    const result: QueueInputReturnv2 = {
      vimState: cloneDeep(targetVimState),
      targetCommand: commandName,
    };
    return result;
  }

  public batchResults(resultList: QueueInputReturnv2[]): QueueInputReturnv2[] {
    const accumulatedResult = resultList.filter((result) => result.vimState);

    //
    function groupByCommand(input: QueueInputReturnv2[]) {
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

  private getCurrentMode(vimState: VimStateV2) {
    const activeMode = vimState.mode;
    if (activeMode === VimMode.NORMAL) {
      return this.normalMode;
      // } else if (activeMode === VimMode.INSERT) {
      //   return this.insertMode;
      // } else if (activeMode === VimMode.VISUAL) {
      //   return this.visualMode;
      // } else if (activeMode === VimMode.VISUALLINE) {
      //   return this.visualLineMode;
    }
  }

  isMode(mode: VimMode) {
    return (vimState: VimStateV2): boolean => {
      const is = vimState.mode === mode;
      return is;
    };
  }

  isInsertMode = this.isMode(VimMode.INSERT);
  isNormalMode = this.isMode(VimMode.NORMAL);
  isVisualMode = this.isMode(VimMode.VISUAL);

  enterMode(mode: VimMode) {
    return (vimState: VimStateV2) => {
      vimState.mode = mode;
      return vimState;
    };
  }

  enterInsertMode = this.enterMode(VimMode.INSERT);
  enterNormalMode = this.enterMode(VimMode.NORMAL);
  enterVisualMode = this.enterMode(VimMode.VISUAL);
}
