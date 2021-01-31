import { AbstractTextMode } from './abstract-text-mode';
import { VimState } from 'modules/vim/vim.types';
import { Logger } from 'modules/debug/logger';
import { changeText } from '../actions/actions-vim-editor';

const logger = new Logger({ scope: 'InsertTextMode' });

export class InsertTextMode extends AbstractTextMode {
  backspace(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorLeft(vimState);
  }

  delete(vimState: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
  }

  type(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.cursorRight(vimState);
  }
}
