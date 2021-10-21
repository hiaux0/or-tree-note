import { Store, StateHistory } from 'aurelia-store';
import { Logger } from 'modules/debug/logger';
import { VimMode, VimState } from 'modules/vim/vim.types';
import { VimEditorState } from 'store/initial-state';
import { changeText } from '../actions/actions-vim-editor';

import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'VisualTextMode' });

export class VisualTextMode extends AbstractTextMode {
  mode: VimMode.VISUAL;

  constructor(
    public parentElement,
    public childSelector,
    public caretElement,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    super(parentElement, childSelector, caretElement, store);
  }

  visualDelete(vimState?: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
  }
}
