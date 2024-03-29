import { autoinject } from 'aurelia-dependency-injection';
import { bindable, computedFrom } from 'aurelia-framework';
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
  VimLine,
} from 'modules/vim/vim-types';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  EditorId,
  EditorIds,
  EditorLine,
  IVimEditor,
  VimEditorState,
} from 'store/initial-state';
import { toggleCheckbox } from 'store/vim-notes/actions-vim-notes';

import './vim-notes.scss';

// const logger = new Logger({ scope: 'VimNotes' });

// declare global {
//   interface Window {
//     vimState: any;
//   }
// }

@autoinject()
@connectTo<StateHistory<VimEditorState>>({
  selector: {
    activeEditorIds: (store) =>
      store.state.pipe(
        map((x) => x.present.activeEditorIds),
        distinctUntilChanged()
      ),
    state: (store) => store.state,
  },
})
export class VimNotes {
  @bindable lines: VimLine[];
  @bindable editorId: EditorId;

  line: EditorLine;
  state: StateHistory<VimEditorState>;

  notesContainerRef: HTMLDivElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = CSS_SELECTORS['editor-line'];
  currentModeName: VimMode;
  vimEditor: VimEditor;

  private readonly activeEditorIds: EditorIds;
  private vimState: VimStateV2;
  private vimMode: VimMode;
  private cursorPosition: Cursor;
  private contenteditable = false;

  /** CONSIDER: because this is an array, observing this might be hard
   * eg. when one item changes or when multiple ids get addded.
   * I want to observer eg the length, so an idea could be to convert
   * the array into a string with comma separation
   */
  @computedFrom('activeEditorIds')
  get isEditorActive() {
    const is = this.activeEditorIds?.includes(this.editorId);
    return is;
  }

  constructor(private readonly store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction('toggleCheckbox', toggleCheckbox);
    this.store.registerAction('changeVimState', changeVimState);
  }

  bind() {
    this.initStoreSubscriptions();
  }

  private initStoreSubscriptions() {
    this.store.state
      .pipe(
        map((x) => x.present.editors[this.editorId]?.vimState),
        distinctUntilChanged()
      )
      .subscribe((vimState) => {
        this.vimState = vimState;
      });
    this.store.state
      .pipe(
        map((x) => x.present.editors[this.editorId]?.vimState?.mode),
        distinctUntilChanged()
      )
      .subscribe((vimMode) => {
        this.vimMode = vimMode;
        this.contenteditable = this.vimMode === VimMode.INSERT;
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-notes.ts ~ line 104 ~ this.contenteditable', this.contenteditable);
        this.vimEditor?.vimEditorTextMode.setSelectionCursorToVimCursor();
      });
    this.store.state
      .pipe(
        map((x) => x.present.editors[this.editorId]?.vimState?.cursor),
        distinctUntilChanged()
      )
      .subscribe((cursorPosition) => {
        this.cursorPosition = cursorPosition;
      });
  }

  attached() {
    this.initVimEditor();
  }

  private initVimEditor() {
    const vimEditorOptions: VimEditorOptions = {
      id: this.editorId,
      parentHtmlElement: this.notesContainerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
      vimExecutingMode: VimExecutingMode.BATCH,
      removeTrailingWhitespace: true,
    };
    vimEditorOptions.plugins = [
      {
        commandName: 'toggleCheckbox',
        execute: () => {
          this.toggleCheckbox();
        },
      },
      {
        commandName: 'save',
        execute: () => {
          const currentState = this.state.present;

          if (vimEditorOptions.removeTrailingWhitespace) {
            // const withoutTrailingWhitespace = this.removeTrailingWhitespace(
            //   this.state.present.editors
            // );
            // currentState.editors = withoutTrailingWhitespace;
          }

          const stringified = JSON.stringify(currentState);
          this.saveToLocalStorage(stringified);
        },
      },
    ];
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

  private removeTrailingWhitespace(editors: IVimEditor[]) {
    editors.forEach((editor) => {
      const updated = editor.vimState.lines.map((line) => {
        return {
          ...line,
          text: line.text.trim(),
        };
      });
      editor.vimState.lines = updated;
    });
    return editors;
  }

  saveToLocalStorage(state: string) {
    try {
      const currentMode = window.localStorage.getItem(CURRENT_OTN_MODE);

      window.localStorage.setItem(currentMode, state);
    } catch (error) {
      console.warn(error);
    }
  }

  toggleCheckbox() {
    const { vimState } = this.vimEditor.vim;
    const { line: targetLineNumber } = vimState.cursor;

    void this.store.dispatch(toggleCheckbox, this.editorId, targetLineNumber);
  }

  undo() {
    void this.store.dispatch(jump, -1);
  }

  private downloadText(): void {
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
