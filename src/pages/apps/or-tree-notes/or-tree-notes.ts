import { autoinject } from "aurelia-dependency-injection";
import { Store, dispatchify, connectTo } from "aurelia-store";
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
    lines: (store) => store.state.pipe(pluck("lines")),
  },
})
export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";
  currentModeName: VimMode;

  constructor(private store: Store<VimEditorState>) {}

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
          execute: () => {},
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
    dispatchify(changeText)("hey");
  }
}
