import { VimEditor, VimEditorOptions } from "modules/vim-editor/vim-editor";
import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";
import { rootContainer } from "modules/root-container";
import { VimEditorTextMode } from "modules/vim-editor/vim-editor-text-mode";
import { VimMode, VimExecutingMode } from "modules/vim/vim.types";

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
      plugins: [
        {
          commandName: "openCommandPalette",
          execute: () => {
            console.log("Hi from OTN");
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
}
