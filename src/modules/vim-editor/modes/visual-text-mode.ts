import { Store, StateHistory } from 'aurelia-store';
import { Logger } from 'modules/debug/logger';
import { VimMode } from 'modules/vim/vim-types';
import { VimEditorState } from 'store/initial-state';

import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'VisualTextMode' });

export class VisualTextMode extends AbstractTextMode {
  mode: VimMode.VISUAL;

  constructor(
    public editerId,
    public parentElement,
    public childSelector,
    public caretElement,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    super(editerId, parentElement, childSelector, caretElement, store);
  }
}
