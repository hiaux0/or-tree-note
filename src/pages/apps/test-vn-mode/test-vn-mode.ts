import { autoinject } from 'aurelia-framework';
import { Store, StateHistory, connectTo } from 'aurelia-store';
import { CSS_SELECTORS } from 'common/css-selectors';
import { changeVimState } from 'modules/vim-editor/actions/actions-vim-editor';
import { VimEditorTextMode } from 'modules/vim-editor/modes/vim-editor-text-mode';
import { VimEditor, VimEditorOptions } from 'modules/vim-editor/vim-editor';
import { initVim } from 'modules/vim/vim-init';
import { VimExecutingMode, VimLine, VimMode } from 'modules/vim/vim-types';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { VimEditorState } from 'store/initial-state';
import './test-vn-mode.scss';

/**
 * 1. contenteditable div
 *   1. get content from the div
 *   2. update content
 * 2. normal mode with styling
 */
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
export class TestVnMode {
  VimMode = VimMode;
  containerRef: HTMLDivElement;
  caretRef: HTMLElement;
  editorLineClass: string = CSS_SELECTORS['editor-line'];
  editorId: number = 0; // TODO update
  isEditorActive = true;
  vimEditor: VimEditor;
  currentModeName: VimMode = VimMode.NORMAL;
  contenteditable = this.currentModeName === VimMode.INSERT;

  constructor(private readonly store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction('changeVimState', changeVimState);
  }

  attached() {
    this.init();
  }

  private init() {
    const texts: string[] = this.containerRef.innerText.split('\n');
    const startLines: VimLine[] = texts.map((text) => ({ text }));

    void initVim({
      container: this.containerRef,
      startLines,
      afterInit: (_vim) => {
        if (this.prevent()) return;

        // const result = vim.queueInputSequence('v');
        // const result = _vim.queueInputSequence('<Control>[');
        // return result;
        this.initVimEditor();
      },
      modeChanged: (mode) => {
        if (this.prevent()) return;

        this.currentModeName = mode;
        this.contenteditable = this.currentModeName === VimMode.INSERT;
      },
      commandListener: (result) => {
        if (this.prevent()) return;
        // console.clear();
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: test-vn-mode.ts ~ line 27 ~ result', result);
      },
    });
  }

  private initVimEditor() {
    const vimEditorOptions: VimEditorOptions = {
      id: this.editorId,
      parentHtmlElement: this.containerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
      vimExecutingMode: VimExecutingMode.BATCH,
      removeTrailingWhitespace: true,
    };
    vimEditorOptions.plugins = [];
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

  private prevent() {
    return false;
  }
}
