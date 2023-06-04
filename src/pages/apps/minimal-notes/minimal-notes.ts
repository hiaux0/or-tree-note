import { bindable } from 'aurelia-framework';
// import { Logger } from 'common/logging/logging';
import { initVim } from 'modules/vim/vim-init';
import { VimStateClass } from 'modules/vim/vim-state';
import {
  VimEditorOptionsV2,
  VimLine,
  VimMode,
  VimStateV2,
} from 'modules/vim/vim-types';
import { StorageService } from 'storage/vimStorage';
import './minimal-notes.scss';

// const logger = new Logger('MinimalNotes');

export class MinimalNotes {
  @bindable() initialVimState: VimStateV2;
  @bindable() active = false;

  inputContainerRef: HTMLDivElement;
  caretRef: HTMLDivElement;
  contenteditable = true;
  currentModeName = VimMode.NORMAL;

  lines: VimLine[] = [];
  vimState: VimStateClass;

  attached() {
    void this.initVim();
  }

  private async initVim() {
    const savedVimState =
      this.initialVimState ?? (await StorageService.getVimState());
    const startLines = savedVimState.lines ?? [];
    this.lines = startLines;

    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      container: this.inputContainerRef,
      caret: this.caretRef,
      childSelector: '.inputLine',
      startLines,
      startCursor: savedVimState.cursor,
      removeTrailingWhitespace: true,
      afterInit: (vim) => {
        this.vimState = vim.vimState;
      },
      onBeforeCommand: () => {
        return this.active;
      },
      commandListener: (vimResult) => {
        if (vimResult.vimState.mode === VimMode.INSERT) {
          /**
           * Special care with how conteneditable is handled.
           * If set text, then another node will get created.
           * Consider how to solve this
           */
          this.vimState.cursor = vimResult.vimState.cursor;
        } else {
          this.vimState = vimResult.vimState;
        }
      },
      modeChanged: (vimResult) => {
        this.vimState = vimResult.vimState;
      },
    };
    vimEditorOptionsV2.plugins = [
      {
        commandName: 'save',
        execute: (vimState) => {
          void StorageService.saveVimState(vimState.serialize());
        },
      },
    ];
    await initVim(vimEditorOptionsV2);
  }
}
