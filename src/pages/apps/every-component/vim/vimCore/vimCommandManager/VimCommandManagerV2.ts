import { cloneDeep } from 'lodash';

import { VimStateV2, VimMode } from '../../../../../../modules/vim/vim-types';

/**
 * - Given input, find command, execute it, and provide result
 */
export class VimCommandManagerV2 {
  executeCommand(vimState: VimStateV2, key: string): VimStateV2 {
    const newVimState: VimStateV2 = cloneDeep(vimState);

    let updateVimState: VimStateV2 = newVimState;
    switch (key) {
      case 'Escape': {
        if (this.isInsertMode(newVimState)) {
          console.log('Should enter normal');
          updateVimState = this.enterNormalMode(newVimState);
        }
        break;
      }
      case 'i': {
        if (this.isNormalMode(newVimState)) {
          console.log('Should enter insert');
          updateVimState = this.enterInsertMode(newVimState);
        }
        break;
      }

      default: {
        console.log('Not assigned: ', key);
        break;
      }
    }

    return updateVimState;
  }

  isMode(mode: VimMode) {
    return (vimState: VimStateV2): boolean => {
      const is = vimState.mode === mode;
      return is;
    };
  }

  isInsertMode = this.isMode(VimMode.INSERT);
  isNormalMode = this.isMode(VimMode.NORMAL);
  isVisualMode = this.isMode(VimMode.VISUAL);

  enterMode(mode: VimMode) {
    return (vimState: VimStateV2) => {
      vimState.mode = mode;
      return vimState;
    };
  }

  enterInsertMode = this.enterMode(VimMode.INSERT);
  enterNormalMode = this.enterMode(VimMode.NORMAL);
  enterVisualMode = this.enterMode(VimMode.VISUAL);
}
