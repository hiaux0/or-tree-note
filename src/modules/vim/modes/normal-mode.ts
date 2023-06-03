// import { Logger } from 'modules/debug/logger';

import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

// const logger = new Logger({ scope: 'NormalMode' });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  async executeCommand(
    commandName: VIM_COMMAND,
    commandValue?: unknown
  ): Promise<VimStateClass> {
    const result = await super.executeCommand(
      commandName,
      commandValue,
      this.currentMode
    );
    return result;
  }

  deleteInnerWord(): VimStateClass {
    const token = super.getTokenUnderCursor();
    const newText = this.vimState
      .getActiveLine()
      .text.replace(token.string, '');
    this.vimState.updateActiveLine(newText);

    return this.vimState;
  }

  clearLine(): VimStateClass {
    return this.vimState;
  }
}
