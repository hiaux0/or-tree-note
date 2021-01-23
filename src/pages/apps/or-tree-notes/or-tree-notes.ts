import { Store, jump, connectTo, StateHistory } from "aurelia-store";
import { autoinject } from "aurelia-dependency-injection";
import { distinctUntilChanged, pluck } from "rxjs/operators";
import { VimEditor, VimEditorOptions } from "modules/vim-editor/vim-editor";
import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";
import { rootContainer } from "modules/root-container";
import { VimEditorTextMode } from "modules/vim-editor/vim-editor-text-mode";
import { VimMode, VimExecutingMode } from "modules/vim/vim.types";
import { EditorLine, MacroType, VimEditorState } from "store/initial-state";
import { toggleCheckbox } from "store/or-tree-notes/actions-or-tree-notes";
import { Logger } from "modules/debug/logger";

const logger = new Logger({ scope: "OrTreeNotes" });

@autoinject()
@connectTo<StateHistory<VimEditorState>>({
  selector: {
    lines: (store) =>
      store.state.pipe(pluck("present", "lines"), distinctUntilChanged()),
    state: (store) => store.state,
  },
})
export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  lines: EditorLine[];
  line: EditorLine;
  state: StateHistory<VimEditorState>;

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";
  currentModeName: VimMode;
  vimEditor: VimEditor;

  constructor(private store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction("toggleCheckbox", toggleCheckbox);
  }

  bind() {}

  attached() {
    const vimEditorOptions: VimEditorOptions = {
      parentHtmlElement: this.notesContainerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
      vimExecutingMode: VimExecutingMode.BATCH,
      plugins: [
        {
          commandName: "toggleCheckbox",
          execute: () => {
            this.toggleCheckbox();
          },
        },
        {
          commandName: "save",
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
  }

  saveToLocalStorage() {
    try {
      this.state.present.cursorBeforeRefresh = this.vimEditor.vim.vimState.cursor;

      const currentState = JSON.stringify(this.state.present);

      window.localStorage.setItem("otn", currentState);
    } catch (error) {
      console.warn(error);
    }
  }

  hasCheckboxMacro(line: EditorLine) {
    const hasCheckbox = line.macros?.find(
      (macro) => macro.type === MacroType.CHECKBOX
    );
    return hasCheckbox;
  }

  isDefaultLine(line: EditorLine) {
    const isDefault = line.macro?.checkbox === undefined;
    return isDefault;
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
