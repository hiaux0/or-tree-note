import { StateHistory, Store } from 'aurelia-store';
import { Logger } from 'modules/debug/logger';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimMode, VimState } from 'modules/vim/vim-types';
import { VimEditorState } from 'store/initial-state';

import { changeText } from '../actions/actions-vim-editor';
import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'NormalTextMode' });

export class NormalTextMode extends AbstractTextMode {
  mode: VimMode.NORMAL;

  constructor(
    public parentElement,
    public childSelector,
    public caretElement,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    super(parentElement, childSelector, caretElement, store);
  }

  deleteInnerWord(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine()
    );
  }

  visualDelete(vimState?: VimStateClass) {
    void this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine()
    );
  }
}
