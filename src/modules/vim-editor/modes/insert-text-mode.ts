import { VimState } from 'modules/vim/vim.types';
import { Logger } from 'modules/debug/logger';

import { AbstractTextMode } from './abstract-text-mode';
import { changeText } from '../actions/actions-vim-editor';

const logger = new Logger({ scope: 'InsertTextMode' });

export class InsertTextMode extends AbstractTextMode {
  backspace(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorLeft(vimState);
  }

  type(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorRight(vimState);
  }
}
