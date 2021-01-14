import { inject } from "aurelia-dependency-injection";
import { Vim, VimExecutingMode } from "modules/vim/vim";
import { VimEditorTextMode } from "./vim-editor-text-mode";

export interface VimEditorOptions {
  // Input / Setup
  inputList?: string[];
  htmlInputList?: HTMLElement[];
  parentHtmlElement?: HTMLElement;
  childSelectors?: string[];
  caretElements?: HTMLElement[];
  // Modes?
  /**
   * Navigate between HTML elements
   */
  isElementMode?: boolean;
  isTextMode?: boolean;
  vimExecutingMode?: VimExecutingMode;
}
const defaultVimEditorOptions: VimEditorOptions = {
  isTextMode: true,
};

@inject(VimEditorTextMode)
export class VimEditor {
  vim: Vim;

  constructor(
    public vimEditorOptions: VimEditorOptions,
    public vimEditorTextMode: VimEditorTextMode
  ) {
    if (this.vimEditorOptions.isTextMode) {
      vimEditorTextMode.setupElementMode();
      vimEditorTextMode.initVim();
      vimEditorTextMode.initKeys();
      this.vim = vimEditorTextMode.getVim();
    }

    // vimEditorTextMode.executeCommandSequenceInEditor("llli^");
    vimEditorTextMode.executeCommandSequenceInEditor("uee");
  }

  getMode() {
    const { currentMode: activeMode } = this.vim.getCurrentMode();
    return activeMode;
  }
}
