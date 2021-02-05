import { AbstractMode } from './abstract-mode';
import { VimState, VimMode } from '../vim.types';

export class VisualMode extends AbstractMode {
  currentMode = VimMode.VISUAL;

  executeCommand(commandName: string, commandValue: string): VimState {
    const newVimState = super.executeCommand(
      commandName,
      commandValue,
      this.currentMode
    );

    newVimState.visualEndCursor = {
      col: newVimState.cursor.col + this.vimState.visualStartCursor.col,
      line: newVimState.cursor.line + this.vimState.visualStartCursor.line,
    };

    return newVimState;
  }
}
