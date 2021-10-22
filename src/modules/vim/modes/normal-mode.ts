import { Logger } from 'modules/debug/logger';

import { VimCommandNames } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimState, VimMode } from '../vim.types';
import { AbstractMode } from './abstract-mode';

const logger = new Logger({ scope: 'NormalMode' });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(
    commandName: VimCommandNames,
    commandValue?: string
  ): VimStateClass {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  deleteInnerWord(): VimStateClass {
    const token = super.getTokenUnderCursor();
    const newText = this.vimState.getActiveLine().replace(token.string, '');
    this.vimState.updateActiveLine(newText);

    return this.vimState;
  }
}
