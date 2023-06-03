import { Logger } from 'modules/debug/logger';
import { replaceRange } from 'modules/string/string';

import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

const logger = new Logger({ scope: 'VisualMode' });

export class VisualMode extends AbstractMode {
  currentMode = VimMode.VISUAL;

  async executeCommand(
    commandName: VIM_COMMAND,
    commandValue: string
  ): Promise<VimStateClass> {
    const newVimState = await super.executeCommand(
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

  visualMoveToOtherEndOfMarkedArea(): VimStateClass {
    const curCursorCol = this.vimState.cursor.col;

    this.vimState.cursor.col = this.vimState.visualStartCursor.col;
    this.vimState.visualStartCursor.col = curCursorCol;

    return this.vimState;
  }

  visualInnerWord(): VimStateClass {
    const token = super.getTokenUnderCursor();
    const isAtStartOfWord = token.start === this.vimState.cursor.col;

    if (!isAtStartOfWord) {
      this.vimState.visualStartCursor = {
        line: this.vimState.cursor.line,
        col: token.start,
      };
      this.vimState.cursor.col = token.start;
    }

    super.cursorWordForwardEnd();

    return this.vimState;
  }

  visualStartLineWise(): VimStateClass {
    this.vimState.visualStartCursor.col = 0;
    this.vimState.cursor.col = this.vimState.getActiveLine().text.length;

    return this.vimState;
  }

  visualDelete(): VimStateClass {
    const { visualStartCursor, visualEndCursor } = this.vimState;
    if (!visualStartCursor) {
      logVisualDeleteError('Need start cursor');
      return this.vimState;
    }
    if (!visualEndCursor) {
      logVisualDeleteError('Need end cursor');
      return this.vimState;
    }

    const text = this.vimState.getActiveLine().text;
    const replaced = replaceRange(
      text,
      visualStartCursor.col,
      visualEndCursor.col
    );
    this.vimState.updateActiveLine(replaced);

    // Put cursor to start of visual
    this.vimState.cursor.col = visualStartCursor.col;

    return this.vimState;
  }
}

function logVisualDeleteError(message: string) {
  logger.debug([message], { isError: true });
}
