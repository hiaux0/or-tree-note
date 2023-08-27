import { bindable, computedFrom } from 'aurelia-framework';
// import { Logger } from 'common/logging/logging';
import { initVim } from 'modules/vim/vim-init';
import {
  VimEditorOptionsV2,
  VimLine,
  VimMode,
  VimStateV2,
} from 'modules/vim/vim-types';
import { StorageService } from 'storage/vimStorage';
import rangy from 'rangy';
import './minimal-notes.scss';

// const logger = new Logger('MinimalNotes');

export class MinimalNotes {
  @bindable() vimState: VimStateV2;
  @bindable() active = false;

  inputContainerRef: HTMLDivElement;
  caretRef: HTMLDivElement;
  currentModeName = VimMode.NORMAL;

  lines: VimLine[] = [];

  @computedFrom('vimState.mode')
  get contenteditable() {
    const is = this.vimState.mode === VimMode.INSERT;
    return is;
  }

  attached() {
    void this.initVim();
  }

  private async initVim() {
    const savedVimState = this.vimState ?? (await StorageService.getVimState());
    const startLines = savedVimState.lines ?? [];
    this.lines = startLines;

    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      vimState: this.vimState,
      container: this.inputContainerRef,
      caret: this.caretRef,
      childSelector: '.inputLine',
      startLines,
      startCursor: savedVimState.cursor,
      removeTrailingWhitespace: true,
      afterInit: (vim) => {
        this.vimState = vim.vimState.serialize();
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
          this.vimState = vimResult.vimState.serialize();
        }
      },
      modeChanged: (vimResult) => {
        this.vimState = vimResult.vimState.serialize();
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
