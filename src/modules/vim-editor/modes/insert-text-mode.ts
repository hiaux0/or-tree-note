import { Logger } from 'modules/debug/logger';
import { VimState } from 'modules/vim/vim.types';

import { changeText } from '../actions/actions-vim-editor';
import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'InsertTextMode' });

export class InsertTextMode extends AbstractTextMode {
  backspace(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorLeft(vimState);
  }

  type(vimState?: VimState) {
    /* prettier-ignore */ console.trace('TCL: changeText')
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorRight(vimState);
  }

  nothing() {}
}
