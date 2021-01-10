import { VimEditor, VimEditorOptions } from "modules/vim-editor/vim-editor";
import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";
import { rootContainer } from "modules/root-container";
import { VimEditorTextMode } from "modules/vim-editor/vim-editor-text-mode";
import { VimExecutingMode, VimMode } from "modules/vim/vim";

export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";
  currentModeName: VimMode;

  bind() {}

  attached() {
    const vimEditorOptions: VimEditorOptions = {
      parentHtmlElement: this.notesContainerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
      vimExecutingMode: VimExecutingMode.BATCH,
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
}
