// import { Logger } from 'modules/debug/logger';

import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

// const logger = new Logger({ scope: 'NormalMode' });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(
    commandName: VIM_COMMAND,
    commandValue?: unknown
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
    let newText = '';
    if (token) {
      newText = this.vimState.getActiveLine().text.replace(token.string, '');
      this.vimState.updateActiveLine(newText);
    } else {
      this.delete();
    }

    return this.vimState;
  }

  clearLine(): VimStateClass {
    this.vimState.updateActiveLine('');
    this.cursorLineEnd();

    return this.vimState;
  }

  enterInsertMode(): VimStateClass {
    this.vimState.mode = VimMode.INSERT;
    return this.vimState;
  }
}
