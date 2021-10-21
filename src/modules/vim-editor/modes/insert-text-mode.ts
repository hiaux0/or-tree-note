import { Logger } from 'modules/debug/logger';
import { VimMode, VimState } from 'modules/vim/vim.types';

import { changeText } from '../actions/actions-vim-editor';
import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'InsertTextMode' });

export class InsertTextMode extends AbstractTextMode {
  mode: VimMode.INSERT;

  backspace(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorLeft(vimState);
  }

  type(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorRight(vimState);
  }

  nothing() {}
}
