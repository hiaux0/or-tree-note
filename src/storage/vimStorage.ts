import localforage from 'localforage';
import { VimStateV2 } from 'modules/vim/vim-types';

import { setInDatabase } from './Database';

export class StorageService {
  public static async saveVimState(vimState: VimStateV2): Promise<VimStateV2> {
    await setInDatabase('vimState', vimState);
    return vimState;
  }

  public static async getVimState(): Promise<VimStateV2> {
    let vimState = await localforage.getItem<VimStateV2>('vimState');
    if (!vimState) vimState = {};
    return vimState;
  }
}
