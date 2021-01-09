import { inject } from "aurelia-dependency-injection";
import { VimEditor, VimEditorOptions } from "modules/vim-editor/vim-editor";
import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";
import { rootContainer } from "modules/root-container";
import { VimEditorTextMode } from "modules/vim-editor/vim-editor-text-mode";
import { VimMode } from "modules/vim/vim";

export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";
  currentModeName: VimMode;

  bind() {}

  attached() {
    console.clear();
    const vimEditorTextMode = rootContainer.get(VimEditorTextMode);
    const vimEditorOptions: VimEditorOptions = {
      parentHtmlElement: this.notesContainerRef,
      childSelectors: [this.editorLineClass],
      caretElements: [this.caretRef],
      isTextMode: true,
    };
    inject(vimEditorOptions, vimEditorTextMode)(VimEditor);

    const vimEditor = rootContainer.get(VimEditor);
    this.currentModeName = vimEditor.getMode();
  }
}
