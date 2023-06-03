import { Logger } from 'modules/debug/logger';
import { replaceRange } from 'modules/string/string';

import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

const logger = new Logger({ scope: 'VisualMode' });

export class VisualLineMode extends AbstractMode {
  currentMode = VimMode.VISUALLINE;

  async executeCommand(
    commandName: VIM_COMMAND,
    commandValue: unknown
  ): Promise<VimStateClass> {
    const newVimState = await super.executeCommand(
      commandName,
      commandValue,
      this.currentMode
    );

    return newVimState;
  }

  cursorUp(): VimStateClass {
    const updatedVimState = super.cursorUp();
    updatedVimState.visualStartCursor.line = updatedVimState.cursor.line;
    // updatedVimState.visualEndCursor.line = updatedVimState.cursor.line;
    this.vimState = updatedVimState;

    return this.vimState;
  }

  cursorDown(): VimStateClass {
    const updatedVimState = super.cursorDown();
    // updatedVimState.visualStartCursor.line = updatedVimState.cursor.line;
    updatedVimState.visualEndCursor.line = updatedVimState.cursor.line;
    this.vimState = updatedVimState;

    return this.vimState;
  }

  visualMoveToOtherEndOfMarkedArea(): VimStateClass {
    const curCursorCol = this.vimState.cursor.col;

    this.vimState.cursor.col = this.vimState.visualStartCursor.col;
    this.vimState.visualStartCursor.col = curCursorCol;

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
