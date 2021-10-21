import { StateHistory, Store } from 'aurelia-store';
import { Logger } from 'modules/debug/logger';
import { VimMode } from 'modules/vim/vim.types';
import { VimEditorState } from 'store/initial-state';

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
}
