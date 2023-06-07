/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { cloneDeep } from 'lodash';
import { VIM_COMMAND } from 'modules/vim/vim-commands-repository';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimStateV2 } from 'modules/vim/vim-types';

let hitCounter = 0;

export class DebugService {
  public static targetCommandNames: VIM_COMMAND[] = [];
  public static inputs: unknown[] = [];
  public static beforeVimStates: VimStateV2[] = [];
  public static afterVimStates: VimStateV2[] = [];

  public static debugAfterHit(hitAmount) {
    hitCounter++;
    const should = hitCounter === hitAmount;
    return should;
  }

  static startDebugCollection(
    targetCommandName: VIM_COMMAND,
    input: unknown,
    vimState: VimStateClass
  ) {
    this.targetCommandNames.push(targetCommandName);
    this.inputs.push(input);
    this.beforeVimStates.push(cloneDeep(vimState.serialize()));
  }

  public static endDebugCollection(vimState: VimStateClass) {
    this.afterVimStates.push(cloneDeep(vimState.serialize()));

    const index = 0;
    /* prettier-ignore */
    const debugCode = `
const beforeVimState = ${JSON.stringify(this.beforeVimStates[index], null, 2)};
const afterVimState = ${JSON.stringify(this.afterVimStates[index], null, 2)};
const vimCore = new VimCore([], {}, { vimState: beforeVimState });
const result = vimCore.executeVimCommand(${this.targetCommandNames[index]}, ${ this.inputs[index] });

    `;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: debugService.ts ~ line 40 ~ debugCode', debugCode);
    return debugCode;
    // void navigator.clipboard.writeText(debugCode);
  }
}
