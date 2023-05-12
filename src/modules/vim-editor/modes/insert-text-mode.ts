import { Logger } from 'modules/debug/logger';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimMode } from 'modules/vim/vim-types';

import { changeText } from '../actions/actions-vim-editor';
import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'InsertTextMode' });

export class InsertTextMode extends AbstractTextMode {
  mode: VimMode.INSERT;

  backspace(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      this.editerId,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
    super.cursorLeft(vimState);
  }

  space(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      this.editerId,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
    super.cursorRight(vimState);
  }

  type(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      this.editerId,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
    super.cursorRight(vimState);
  }

  nothing() {}
}
