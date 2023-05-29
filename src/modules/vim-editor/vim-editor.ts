import { VimCore } from 'modules/vim/vim';
import { VimExecutingMode, VimPlugin } from 'modules/vim/vim-types';

import { VimEditorTextMode } from './modes/vim-editor-text-mode';

export interface VimEditorOptions {
  id: number;
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

  removeTrailingWhitespace?: boolean;
}
// const defaultVimEditorOptions: VimEditorOptions = { isTextMode: true, };

export class VimEditor {
  vim: VimCore;

  constructor(
    public vimEditorOptions: VimEditorOptions,
    public vimEditorTextMode: VimEditorTextMode
  ) {
    if (this.vimEditorOptions.isTextMode === true) {
      vimEditorTextMode.setupElementMode();
      vimEditorTextMode.init();
      this.vim = vimEditorTextMode.getVim();
    }

    setTimeout(() => {
      // vimEditorTextMode.executeCommandSequenceInEditor('diwe');
      // vimEditorTextMode.executeCommandSequenceInEditor('it<Space>'); // awaiting command
      // vimEditorTextMode.executeCommandSequenceInEditor('iu<Space>');
      // vimEditorTextMode.executeCommandSequenceInEditor('it<Backspace>'); // awaiting command
      // vimEditorTextMode.executeCommandSequenceInEditor('u<Space>tc'); // stuck at `t` as `toCharacterBefore`
      // vimEditorTextMode.executeCommandSequenceInEditor('u');
    }, 1000);
  }

  getMode() {
    const currentMode = this.vim.getCurrentMode().currentMode;
    return currentMode;
  }
}
