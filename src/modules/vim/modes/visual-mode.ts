import { Logger } from 'modules/debug/logger';
import { replaceRange } from 'modules/string/string';

import { VimState, VimMode } from '../vim.types';
import { AbstractMode } from './abstract-mode';

const logger = new Logger({ scope: 'VisualMode' });

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
      line: newVimState.cursor.line,
    };

    return newVimState;
  }

  visualMoveToOtherEndOfMarkedArea(): VimState {
    const curCursorCol = this.vimState.cursor.col;

    this.vimState.cursor.col = this.vimState.visualStartCursor.col;
    this.vimState.visualStartCursor.col = curCursorCol;

    return this.vimState;
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
    this.vimState.cursor.col = this.vimState.text.length;

    return this.vimState;
  }

  visualDelete(): VimState {
    const { text, visualStartCursor, visualEndCursor } = this.vimState;
    if (!visualStartCursor) {
      logVisualDeleteError('Need start cursor');
      return this.vimState;
    }
    if (!visualEndCursor) {
      logVisualDeleteError('Need end cursor');
      return this.vimState;
    }

    const replaced = replaceRange(
      text,
      visualStartCursor.col,
      visualEndCursor.col
    );
    this.vimState.text = replaced;

    // Put cursor to start of visual
    this.vimState.cursor.col = visualStartCursor.col; /*?*/
    this.vimState; /*?*/

    return this.vimState;
  }
}

function logVisualDeleteError(message: string) {
  logger.debug([message], { isError: true });
}
