import { bindable, computedFrom } from 'aurelia-framework';
import './multiple-minimal-notes.scss';
import { initVim } from 'modules/vim/vim-init';
import { VimEditorOptionsV2, VimMode, VimStateV2 } from 'modules/vim/vim-types';
import { StorageService } from 'storage/vimStorage';
import { VimEditorState } from 'store/initial-state';

export class MultipleMinimalNotes {
  @bindable value = 'MultipleMinimalNotes';
  vimStates: VimStateV2[];
  vimEditorMap: VimEditorState;
  multileNotesContainerRef: HTMLElement;

  @computedFrom('vimEditorMap.editors')
  get vimEditors() {
    const asArr = Object.values(this.vimEditorMap?.editors ?? {});
    return asArr;
  }

  async attached() {
    this.vimStates = await Promise.all([
      await StorageService.getVimState(),
      await StorageService.getVimState(),
      await StorageService.getVimState(),
    ]);
    this.vimStates.forEach((state, index) => (state.id = String(index)));

    const storedVimEditors = await StorageService.getVimEditors();

    this.vimEditorMap = Object.keys(storedVimEditors).length
      ? storedVimEditors
      : {
          editors: {
            '0': {
              name: 'test name',
              vimState: this.vimStates[0],
              linesAddons: {},
            },
            '1': {
              vimState: this.vimStates[1],
              linesAddons: {},
            },
          },
          activeEditorIds: ['0'],
        };
    /* prettier-ignore */ console.log('vimState.id:', this.vimEditorMap.editors['0'].vimState.id);

    void this.initVim();
  }

  async initVim() {
    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      container: this.multileNotesContainerRef,
      commandListener: (vimResult) => {},
      modeChanged: (vimResult) => {},
    };
    vimEditorOptionsV2.plugins = [
      {
        commandName: 'save',
        execute: (vimState) => {
          console.log('hello');
          void StorageService.saveVimEditors(this.vimEditorMap);
        },
      },
    ];
    await initVim(vimEditorOptionsV2);
  }
}
