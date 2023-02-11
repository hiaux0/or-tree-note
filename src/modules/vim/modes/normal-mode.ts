// import { Logger } from 'modules/debug/logger';

import { VimCommandNames } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

// const logger = new Logger({ scope: 'NormalMode' });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(
    commandName: VimCommandNames,
    commandValue?: string
  ): VimStateClass {
    const result = super.executeCommand(
      commandName,
      commandValue,
      this.currentMode
    );
    return result;
  }

  deleteInnerWord(): VimStateClass {
    const token = super.getTokenUnderCursor();
    const newText = this.vimState.getActiveLine().replace(token.string, '');
    this.vimState.updateActiveLine(newText);

    return this.vimState;
  }

  deleteLine(): VimStateClass {
    const curLine = this.vimState.cursor.line;
    this.vimState.lines.splice(curLine, 1);

    let newCol = 0;
    if (this.vimState.getPreviousLine()) {
      newCol = Math.max(0, this.vimState.getPreviousLine().length - 1);
    } else {
      newCol = 0;
    }
    this.vimState.cursor.col = newCol;

    this.vimState.cursor.line = Math.max(curLine - 1, 0);
    const activeLine = this.vimState.getActiveLine();
    this.vimState.updateActiveLine(activeLine ?? '');

    //
    this.vimState.deletedLinesIndeces = [curLine];

    return this.vimState;
  }
}
