import { inject } from "aurelia-dependency-injection";
import { Vim } from "modules/vim/vim";
import { VimExecutingMode, VimPlugin } from "modules/vim/vim.types";
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
  plugins?: VimPlugin[];
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

    vimEditorTextMode.executeCommandSequenceInEditor("<Space>cp");
  }

  getMode() {
    const { currentMode: activeMode } = this.vim.getCurrentMode();
    return activeMode;
  }
}
