import { cloneDeep } from 'lodash';

import { Logger } from '../../../../../common/logging/logging';
import { VIM_COMMAND } from '../../../../../modules/vim/vim-commands-repository';
import {
  VimStateV2,
  VimOptions,
  VimMode,
} from '../../../../../modules/vim/vim-types';
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
  private vimState: VimStateV2 = {};
  private readonly vimOptions: VimOptions;

  constructor(vimState: VimStateV2 = {}, vimOptions: VimOptions = {}) {
    this.vimState = vimState;
    this.vimOptions = vimOptions;

    this.vimCommandManager = new VimCommandManagerV2();

    // defaults
    this.vimState.mode = VimMode.NORMAL;
  }

  public executeCommand(key: string): VimStateV2 | undefined {
    // Old -------------------------------------------------------
    const oldMode = this.vimState.mode;
    /* prettier-ignore */ logger.culogger.debug(['Old Mode: %s', oldMode], {}, (...r)=>console.log(...r));

    // Execute -------------------------------------------------------
    const updatedVimState = this.vimCommandManager.executeCommand(
      this.vimState,
      key
    );
    if (!updatedVimState) return;
    /* prettier-ignore */ logger.culogger.debug(['updatedVimState: %o', updatedVimState], {}, (...r)=>console.log(...r));

    this.vimOptions.hooks.commandListenerv2({
      vimState: updatedVimState,
      targetCommand: VIM_COMMAND.nothing,
    });

    // Hooks: modeChanged -------------------------------------------------------
    const newMode = updatedVimState.mode;
    const hasModeChanged = oldMode !== newMode;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimCoreV2.ts:58 ~ hasModeChanged:', hasModeChanged);
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
    return updatedVimState;
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
    // console.trace('reportVimState');
    const { cursor, lines, mode } = state ?? this.vimState;
    logger.culogger.overwriteDefaultLogOtpions({ log: true });
    /* prettier-ignore */ if (mode) logger.culogger.debug(['Vim in Mode:', mode], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Cursor at', {...cursor}], {}, (...r) => console.log(...r));
    /* prettier-ignore */ logger.culogger.debug(['Lines are', lines.map(l => l.text)], {}, (...r) => console.log(...r));
    logger.culogger.overwriteDefaultLogOtpions({ log: false });
  }
}
