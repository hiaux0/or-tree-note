import { StateHistory, Store } from 'aurelia-store';
import { Logger } from 'modules/debug/logger';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimMode } from 'modules/vim/vim-types';
import { VimEditorState } from 'store/initial-state';

import { changeText } from '../actions/actions-vim-editor';
import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'NormalTextMode' });

export class NormalTextMode extends AbstractTextMode {
  mode: VimMode.NORMAL;

  constructor(
    public editerId,
    public parentElement,
    public childSelector,
    public caretElement,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    super(editerId, parentElement, childSelector, caretElement, store);
  }

  deleteInnerWord(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      this.editerId,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
  }

  visualDelete(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      this.editerId,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
  }
}
