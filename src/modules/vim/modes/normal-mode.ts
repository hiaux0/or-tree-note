import { Logger } from 'modules/debug/logger';
import { VimCommandNames } from '../vim-commands-repository';
import { VimState, VimMode } from '../vim.types';
import { AbstractMode } from './abstract-mode';

const logger = new Logger({ scope: 'NormalMode' });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(
    commandName: VimCommandNames,
    commandValue?: string
  ): VimState {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }
}
