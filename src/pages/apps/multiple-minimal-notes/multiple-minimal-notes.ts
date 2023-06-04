import { bindable, computedFrom } from 'aurelia-framework';
import './multiple-minimal-notes.scss';
import { VimStateV2 } from 'modules/vim/vim-types';
import { StorageService } from 'storage/vimStorage';
import { VimEditorState } from 'store/initial-state';

export class MultipleMinimalNotes {
  @bindable value = 'MultipleMinimalNotes';
  vimStates: VimStateV2[];
  vimEditorMap: VimEditorState;

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

    this.vimEditorMap = {
      editors: {
        '0': {
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
  }
}
