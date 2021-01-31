import { AbstractMode } from './abstract-mode';
import { VimState, VimMode } from '../vim.types';

export class VisualMode extends AbstractMode {
  currentMode = VimMode.VISUAL;

  executeCommand(commandName: string, commandValue: string): VimState {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }
}
