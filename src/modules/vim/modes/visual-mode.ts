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
      col: newVimState.cursor.col,
      line: newVimState.cursor.line + this.vimState.visualStartCursor.line,
    };

    return newVimState;
  }

  visualInnerWord(): VimState {
    const token = super.getTokenUnderCursor();
    const isAtStartOfWord = token.start === this.vimState.cursor.col;

    if (!isAtStartOfWord) {
      this.vimState.visualStartCursor = {
        col: token.start,
        line: this.vimState.cursor.line,
      };
      this.vimState.cursor.col = token.start;
    }

    super.cursorWordForwardEnd();

    return this.vimState;
  }

  visualStartLineWise(): VimState {
    this.vimState.visualStartCursor.col = 0;
    this.vimState.cursor.col = this.vimState.text.length

    return this.vimState;
  }
}
