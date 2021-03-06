import { bindable } from 'aurelia-framework';
import { Store, jump, connectTo, StateHistory } from 'aurelia-store';
import { autoinject } from 'aurelia-dependency-injection';
import { distinctUntilChanged, pluck } from 'rxjs/operators';

import { CSS_SELECTORS } from 'common/css-selectors';
import { Logger } from 'modules/debug/logger';
import { rootContainer } from 'modules/root-container';
import { VimEditor, VimEditorOptions } from 'modules/vim-editor/vim-editor';
import { VimEditorTextMode } from 'modules/vim-editor/modes/vim-editor-text-mode';
import { changeVimState } from 'modules/vim-editor/actions/actions-vim-editor';
import {
  VimMode,
  VimExecutingMode,
  Cursor,
  VimState,
} from 'modules/vim/vim.types';
import { EditorLine, VimEditorState } from 'store/initial-state';
import { toggleCheckbox } from 'store/or-tree-notes/actions-or-tree-notes';
import { CURRENT_OTN_MODE } from 'local-storage';

import './or-tree-notes.scss';

const logger = new Logger({ scope: 'OrTreeNotes' });

declare global {
  interface Window {
    vimState:any;
  }
}


@autoinject()
@connectTo<StateHistory<VimEditorState>>({
  selector: {
    lines: (store) =>
      store.state.pipe(pluck('present', 'lines'), distinctUntilChanged()),
    vimState: (store) => store.state.pipe(pluck('present', 'vimState'), distinctUntilChanged()),
    vimMode: (store) => store.state.pipe(pluck('present', 'vimState', 'mode'), distinctUntilChanged()),
    cursorPosition: (store) =>
      store.state.pipe(
        pluck('present', 'vimState', 'cursor'),
        distinctUntilChanged()
      ),
    state: (store) => store.state,
  },
})
export class OrTreeNotes {
  @bindable value = 'OrTreeNotes';

  cursorPosition: Cursor;
  lines: EditorLine[];
  line: EditorLine;
  state: StateHistory<VimEditorState>;

  notesContainerRef: HTMLDivElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = CSS_SELECTORS['editor-line'];
  currentModeName: VimMode;
  vimEditor: VimEditor;
  vimState: VimState;

  constructor(private store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction('toggleCheckbox', toggleCheckbox);
    this.store.registerAction('changeVimState', changeVimState);
  }

  attached() {
    const vimEditorOptions: VimEditorOptions = {
      parentHtmlElement: this.notesContainerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
      vimExecutingMode: VimExecutingMode.BATCH,
      plugins: [
        {
          commandName: 'toggleCheckbox',
          execute: () => {
            this.toggleCheckbox();
          },
        },
        {
          commandName: 'save',
          execute: () => {
            this.saveToLocalStorage();
          },
        },
      ],
    };
    rootContainer.registerInstance(
      VimEditorTextMode,
      new VimEditorTextMode(vimEditorOptions, this.store)
    );
    const vimEditorTextMode = rootContainer.get(VimEditorTextMode);
    rootContainer.registerInstance(
      VimEditor,
      new VimEditor(vimEditorOptions, vimEditorTextMode)
    );

    this.vimEditor = rootContainer.get(VimEditor);
    this.currentModeName = this.vimEditor.getMode();

    this.store.dispatch('changeVimState', this.vimEditor.vim.vimState);
  }

  saveToLocalStorage() {
    try {
      const currentState = JSON.stringify(this.state.present);
      const currentMode = window.localStorage.getItem(CURRENT_OTN_MODE);

      window.localStorage.setItem(currentMode, currentState);
    } catch (error) {
      console.warn(error);
    }
  }

  toggleCheckbox() {
    const { vimState } = this.vimEditor.vim;
    const { line: targetLineNumber } = vimState.cursor;

    this.store.dispatch(toggleCheckbox, targetLineNumber);
  }

  undo() {
    this.store.dispatch(jump, -1);
  }


}
