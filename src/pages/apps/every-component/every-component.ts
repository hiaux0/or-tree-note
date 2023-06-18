import { bindable, computedFrom } from 'aurelia-framework';
import './every-component.scss';
import { VimMode, VimStateV2 } from 'modules/vim/vim-types';

import { testVimState } from './vim/vimCore/VimCoreV2';
import { VimInputHandler } from './vim/vimUi/VimInputHandler';

export class EveryComponent {
  @bindable value = 'EveryComponent';
  private readonly caretRef: HTMLDivElement;
  private readonly inputContainerRef: HTMLDivElement;
  private mode: VimMode;
  private vimState: VimStateV2 = testVimState;
  /** Should be moved inside vim */
  private tempVimStateInsertMode: VimStateV2;

  private readonly active = true;

  @computedFrom('vimState.mode')
  get contenteditable() {
    const is = this.vimState.mode === VimMode.INSERT;
    return is;
  }

  attached() {
    this.tempVimStateInsertMode = this.vimState;

    new VimInputHandler({
      container: this.inputContainerRef,
      caret: this.caretRef,
      childSelector: 'inputLine',
      afterInitv2: (vimCore) => {
        this.vimState.mode = vimCore.getVimState().mode;
      },
      commandListener: (vimResult) => {},
      commandListenerv2: (vimResult) => {
        this.updateVimState(vimResult.vimState);
      },
      modeChangedv2: (vimResult) => {
        this.mode = vimResult.vimState.mode;
        this.updateVimState(vimResult.vimState);
      },
    });
  }

  private updateVimState(newVimState?: VimStateV2) {
    this.tempVimStateInsertMode = newVimState;
    if (this.mode === VimMode.INSERT) {
      return;
    }
    this.vimState = newVimState ?? this.tempVimStateInsertMode;
  }
}
