import { cloneDeep } from 'lodash';

import { Logger } from '../../../../../common/logging/logging';
import { VIM_COMMAND } from '../../../../../modules/vim/vim-commands-repository';
import { defaultVimOptions } from '../../../../../modules/vim/vim-core';
import {
  VimStateV2,
  VimOptions,
  VimMode,
  VimExecutingMode,
  QueueInputReturn,
  QueueInputReturnv2,
} from '../../../../../modules/vim/vim-types';
import { ShortcutService } from '../../shortcuts/ShortcutService';
import { VimCommandManagerV2 } from './vimCommandManager/VimCommandManagerV2';

const logger = new Logger('VimCoreV2');

export const testVimState: VimStateV2 = {
  lines: [{ text: '0123' }, { text: 'abcd' }],
  cursor: { col: 0, line: 0 },
};

/**
 * Main concern: Given an input, return the executed command's output
 */
export class VimCoreV2 {
  private readonly vimCommandManager: VimCommandManagerV2;

  constructor(
    private vimState: VimStateV2 = {},
    private readonly vimOptions: VimOptions = defaultVimOptions
  ) {
    this.vimState = vimState;
    const finalOptions = {
      ...defaultVimOptions,
      ...vimOptions,
    };
    this.vimOptions = finalOptions;

    this.vimCommandManager = new VimCommandManagerV2(vimState, finalOptions);

    // defaults
    this.vimState.mode = VimMode.NORMAL;
  }

  public executeCommand(
    vimState: VimStateV2,
    input: string,
    modifiers: string[]
  ): QueueInputReturnv2 | undefined {
    // Old -------------------------------------------------------
    const oldMode = this.vimState.mode;
    /* prettier-ignore */ logger.culogger.debug(['Old Mode: %s', oldMode], {}, (...r)=>console.log(...r));

    // Execute -------------------------------------------------------
    const executedResult = this.vimCommandManager.executeCommand(
      vimState,
      input,
      modifiers
    );
    if (!executedResult) return;

    const updatedVimState = executedResult.vimState;
    if (!updatedVimState) return;
    /* prettier-ignore */ logger.culogger.debug(['updatedVimState: %o', updatedVimState], {}, (...r)=>console.log(...r));

    this.vimOptions.hooks.commandListenerv2({
      vimState: updatedVimState,
      targetCommand: VIM_COMMAND.nothing,
    });

    // Hooks: modeChanged -------------------------------------------------------
    const newMode = updatedVimState.mode;
    const hasModeChanged = oldMode !== newMode;
    if (hasModeChanged) {
      /* prettier-ignore */ logger.culogger.debug(['New Mode: %s', newMode], {}, (...r)=>console.log(...r));
      this.vimOptions.hooks.modeChangedv2(
        {
          vimState: updatedVimState,
          targetCommand: VIM_COMMAND.nothing,
        },
        newMode,
        oldMode
      );
    }

    this.setVimState(updatedVimState);
    return executedResult;
  }

  queueInputSequence(
    inputSequence: string | string[],
    vimExecutingMode: VimExecutingMode = VimExecutingMode.INDIVIDUAL
  ): QueueInputReturnv2[] {
    const resultList: QueueInputReturnv2[] = [];
    let givenInputSequence: string[];

    if (typeof inputSequence === 'string') {
      givenInputSequence = ShortcutService.splitInputSequence(inputSequence);
    } else {
      givenInputSequence = inputSequence;
    }

    let vimState = this.getVimState();
    givenInputSequence.forEach((input) => {
      const subResult = this.vimCommandManager.executeCommand(
        vimState,
        input,
        []
      );
      if (subResult?.targetCommand !== undefined) {
        vimState = subResult.vimState;
        resultList.push(subResult);
      }
    });
    // await Promise.all(
    // );

    if (vimExecutingMode === VimExecutingMode.INDIVIDUAL) {
      return resultList;
    }

    // const batched = this.vimCommandManager.batchResults(resultList);
    // batched.forEach((batch) => {
    //   /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimCoreV2.ts:125 ~ batch.vimState.cursor:', batch.vimState.cursor);
    // });
    // return batched;
  }

  public getVimState() {
    return cloneDeep(this.vimState);
  }

  public getMode() {
    return this.vimState.mode;
  }

  public setVimState(vimState: VimStateV2) {
    this.vimState = vimState;
    this.reportVimState();
  }

  public reportVimState(state?: VimStateV2) {
    return;
    // console.trace('reportVimState');
    const { cursor, lines, mode } = state ?? this.vimState;
    logger.culogger.overwriteDefaultLogOtpions({ log: true });
    /* prettier-ignore */ if (mode) logger.culogger.debug(['Vim in Mode:', mode], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Cursor at', {...cursor}], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Lines are', lines.map(l => l.text)], {}, (...r) => console.log(...r));
    logger.culogger.overwriteDefaultLogOtpions({ log: false });
  }
}