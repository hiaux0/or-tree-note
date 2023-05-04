import { autoinject } from 'aurelia-dependency-injection';
import { bindable } from 'aurelia-framework';
import { Store, jump, connectTo, StateHistory } from 'aurelia-store';
import { CSS_SELECTORS } from 'common/css-selectors';
import { CURRENT_OTN_MODE } from 'local-storage';
// import { Logger } from 'modules/debug/logger';
import { changeVimState } from 'modules/vim-editor/actions/actions-vim-editor';
import { VimEditorTextMode } from 'modules/vim-editor/modes/vim-editor-text-mode';
import { VimEditor, VimEditorOptions } from 'modules/vim-editor/vim-editor';
import {
  VimMode,
  VimExecutingMode,
  Cursor,
  VimStateV2,
} from 'modules/vim/vim-types';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EditorLine, VimEditorState } from 'store/initial-state';
import { toggleCheckbox } from 'store/or-tree-notes/actions-or-tree-notes';

import './or-tree-notes.scss';

// const logger = new Logger({ scope: 'OrTreeNotes' });

// declare global {
//   interface Window {
//     vimState: any;
//   }
// }

@autoinject()
@connectTo<StateHistory<VimEditorState>>({
  selector: {
    vimMode: (store) =>
      store.state.pipe(
        map((x) => x.present.editors[x.present.activeEditor]?.vimState?.mode),
        distinctUntilChanged()
      ),
    cursorPosition: (store) =>
      store.state.pipe(
        map((x) => x.present.editors[x.present.activeEditor]?.vimState?.cursor),
        distinctUntilChanged()
      ),
  },
})
export class OrTreeNotes {
  @bindable lines: EditorLine[];
  @bindable vimState: VimStateV2;
  @bindable editorId: number;

  cursorPosition: Cursor;
  line: EditorLine;
  state: StateHistory<VimEditorState>;

  notesContainerRef: HTMLDivElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = CSS_SELECTORS['editor-line'];
  currentModeName: VimMode;
  vimEditor: VimEditor;
  pastLines: any;

  constructor(private readonly store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction('toggleCheckbox', toggleCheckbox);
    this.store.registerAction('changeVimState', changeVimState);
  }

  attached() {
    this.lines;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: or-tree-notes.ts ~ line 69 ~ this.lines', this.lines);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: or-tree-notes.ts ~ line 83 ~ this.cursorPosition', this.cursorPosition);
    const vimEditorOptions: VimEditorOptions = {
      id: this.editorId,
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
    const vimEditorTextMode = new VimEditorTextMode(
      vimEditorOptions,
      this.store
    );
    this.vimEditor = new VimEditor(vimEditorOptions, vimEditorTextMode);
    this.currentModeName = this.vimEditor.getMode();

    void this.store.dispatch(
      'changeVimState',
      this.editorId,
      this.vimEditor.vim.vimState
    );
    // document.addEventListener('click', () => {});
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

    void this.store.dispatch(toggleCheckbox, targetLineNumber);
  }

  undo() {
    void this.store.dispatch(jump, -1);
  }

  private downloadText(): void {
    function getRandomId() {
      /**
       * "0.g6ck5nyod4".substring(2, 9)
       * -> g6ck5ny
       */
      return Math.random().toString(36).substring(2, 9);
    }
    function getCurrentDate() {
      const date = new Date();
      const dateString = date.toLocaleDateString();
      return dateString;
    }

    function download(content: string, fileName: string) {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
      );
      element.setAttribute('download', `${fileName}.json`);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }

    const stringify = JSON.stringify(this.vimState, null, 4);
    const fileName = `${getCurrentDate()}-or-tree-note`;
    download(stringify, fileName);
  }
}
