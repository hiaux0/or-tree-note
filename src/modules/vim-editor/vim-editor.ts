import { inject } from "aurelia-dependency-injection";
import { Vim, VimMode } from "modules/vim/vim";
import { rootContainer } from "../root-container";
import { VimEditorTextMode } from "./vim-editor-text-mode";
import hotkeys from "hotkeys-js";

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
}
const defaultVimEditorOptions: VimEditorOptions = {
  isTextMode: true,
};

export class VimEditor {
  vim: Vim;

  constructor(public vimEditorOptions: VimEditorOptions) {
    this.vimEditorOptions = {
      ...this.vimEditorOptions,
      ...defaultVimEditorOptions,
    };

    if (this.vimEditorOptions.isTextMode) {
      const vimEditorTextMode = new VimEditorTextMode(vimEditorOptions);
      vimEditorTextMode.setupElementMode();
      vimEditorTextMode.initVim();
      vimEditorTextMode.initKeys();
      this.vim = vimEditorTextMode.getVim();
    }
  }

  getMode() {
    const { activeMode } = this.vim.getCurrentMode();
    return activeMode;
  }
}
