import { autoinject } from "aurelia-dependency-injection";
import { Store, jump, connectTo, StateHistory } from "aurelia-store";
import { pluck } from "rxjs/operators";
import { VimEditor, VimEditorOptions } from "modules/vim-editor/vim-editor";
import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";
import { rootContainer } from "modules/root-container";
import { VimEditorTextMode } from "modules/vim-editor/vim-editor-text-mode";
import { VimMode, VimExecutingMode } from "modules/vim/vim.types";
import { VimEditorState } from "store/initial-state";
import { changeText } from "store/or-tree-notes/actions-or-tree-notes";

@autoinject()
@connectTo({
  selector: {
    lines: (store) => store.state.pipe(pluck("present", "lines")),
  },
})
export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";
  currentModeName: VimMode;

  constructor(private store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction("changeText", changeText);
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
            this.changeText();
          },
        },
      ],
    };
    rootContainer.registerInstance(
      VimEditorTextMode,
      new VimEditorTextMode(vimEditorOptions)
    );
    const vimEditorTextMode = rootContainer.get(VimEditorTextMode);
    rootContainer.registerInstance(
      VimEditor,
      new VimEditor(vimEditorOptions, vimEditorTextMode)
    );

    const vimEditor = rootContainer.get(VimEditor);
    this.currentModeName = vimEditor.getMode();
  }

  changeText() {
    this.store.dispatch(changeText, "hey");
  }

  undo() {
    this.store.dispatch(jump, -1);
  }
}
