import { bindable, computedFrom } from 'aurelia-framework';
import './multiple-minimal-notes.scss';
import { getRandomId } from 'common/random';
import hotkeys from 'hotkeys-js';
import { cloneDeep } from 'lodash';
import { initVim } from 'modules/vim/vim-init';
import { VimEditorOptionsV2, VimMode, VimStateV2 } from 'modules/vim/vim-types';
import { StorageService } from 'storage/vimStorage';
import { EditorId, IVimEditor, VimEditorState } from 'store/initial-state';

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
      ? // this.vimEditorMap = false
        storedVimEditors
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

    this.initEventListeners();
    void this.initVim();
  }

  private initEventListeners() {
    document.addEventListener('click', (ev: MouseEvent) => {
      const $target = ev.target as HTMLElement;
      const $notesContainer = $target.closest<HTMLElement>(
        '.notesComponentContainer'
      );
      if (!$notesContainer) return;

      const $note = $notesContainer.querySelector<HTMLElement>('.minimalNote');
      const vimId = $note.dataset.vimId;
      /** ISSUE-jMia9Mjf: overwrite for now, should add managing */
      this.vimEditorMap.activeEditorIds = [vimId];
    });
  }

  async initVim() {
    hotkeys('ctrl+s', (ev) => {
      ev.preventDefault();
      void StorageService.saveVimEditors(this.vimEditorMap);
    });
    // const vimEditorOptionsV2: VimEditorOptionsV2 = {
    //   id: 'mmn-container',
    //   container: this.multileNotesContainerRef,
    //   commandListener: (vimResult) => {},
    //   modeChanged: (vimResult) => {},
    // };
    // vimEditorOptionsV2.plugins = [
    //   {
    //     commandName: 'save',
    //     execute: () => {
    //       void StorageService.saveVimEditors(this.vimEditorMap);
    //     },
    //   },
    // ];
    // await initVim(vimEditorOptionsV2);
  }

  private addNote(): void {
    const id = getRandomId();
    const newEditor: IVimEditor = {
      vimState: { lines: [{ text: '' }], cursor: { col: 0, line: 0 }, id },
      linesAddons: {},
    };
    this.vimEditorMap.editors[id] = newEditor;
    this.vimEditorMap.editors = cloneDeep(this.vimEditorMap.editors);
  }

  private removeNote(editorId: EditorId): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.vimEditorMap.editors[editorId];
    this.vimEditorMap.editors = cloneDeep(this.vimEditorMap.editors);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: multiple-minimal-notes.ts:105 ~ editorId:', editorId);
  }
}
