import { bindable } from 'aurelia-framework';
import './every-component.scss';
import { Logger } from 'common/logging/logging';
import { isMac } from 'common/platform/platform-check';
import { cloneDeep } from 'lodash';
import { VIM_COMMAND } from 'modules/vim/vim-commands-repository';
import {
  VimEditorOptionsV2,
  VimLine,
  VimMode,
  VimOptions,
  VimStateV2,
} from 'modules/vim/vim-types';

const logger = new Logger('EveryComponent');

const testVimState: VimStateV2 = {
  lines: [{ text: '0123' }, { text: 'abcd' }],
  cursor: { col: 0, line: 0 },
};

export class EveryComponent {
  @bindable value = 'EveryComponent';
  private readonly containerRef: HTMLDivElement;
  private readonly noteContainerRef: HTMLDivElement;
  private mode = VimMode.INSERT;
  vimInputHandler: VimInputHandler;
  private vimState: VimStateV2 = testVimState;

  attached() {
    this.vimInputHandler = new VimInputHandler({
      container: this.noteContainerRef,
      childSelector: 'inputLine',
      commandListener: (vimResult) => {},
      commandListenerv2: (vimResult) => {
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:35 ~ vimResult:', vimResult);
        this.vimState = vimResult.vimState;
      },
      modeChangedv2: (vimResult) => {
        this.mode = vimResult.vimState.mode;
      },
    });
    // this.vimInputHandler.init();
  }
}

/**
 * Handle input and provide an API to interact with the result
 */
export class VimInputHandler {
  vimCore: VimCore;
  container: HTMLElement;
  vimEditorOptions: VimEditorOptionsV2;

  constructor(vimEditorOptions: VimEditorOptionsV2) {
    const lines = this.getTextFromChildren(vimEditorOptions);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:46 ~ lines:', lines);

    this.vimCore = new VimCore(
      { lines },
      {
        hooks: {
          modeChangedv2: (vimResults, newMode, oldMode) => {
            vimEditorOptions.modeChangedv2(vimResults, newMode, oldMode);
          },
          commandListenerv2: (vimResults) => {
            if (this.vimCore.getVimState().mode === VimMode.INSERT) {
              setTimeout(() => {
                const lines = this.getTextFromChildren(vimEditorOptions);
                /* prettier-ignore */ logger.culogger.todo('update insert to normal', (...r)=>console.log(...r));
                /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:60 ~ lines:', lines);
                const vimState = this.vimCore.getVimState();
                vimState.lines = lines;
                this.vimCore.setVimState(vimState);

                vimResults.vimState = vimState;
                vimEditorOptions.commandListenerv2(vimResults);
              }, 0);
            }
          },
        },
      }
    );

    this.vimEditorOptions = vimEditorOptions;
    this.container = vimEditorOptions.container;

    this.init();
  }

  private getTextFromChildren({
    container,
    childSelector,
  }: VimEditorOptionsV2): VimLine[] {
    const $children = container.querySelectorAll(`.${childSelector}`);
    const lines: VimLine[] = [];
    $children.forEach((child) => {
      lines.push({ text: child.textContent });
    });
    return lines;
  }

  init() {
    this.container.addEventListener('keydown', (ev) => {
      console.clear();
      if (this.checkAllowedBrowserShortcuts(ev)) return;

      // ev.preventDefault();
      /* prettier-ignore */ logger.culogger.debug(['Received input %s', ev.key], {}, (...r)=>console.log(...r));
      const vimState = this.vimCore.executeCommand(ev.key);
    });
  }

  checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
    const mainModifier = isMac ? ev.metaKey : ev.ctrlKey;
    const reload = ev.key === 'r' && mainModifier;
    const hardReload = ev.key === 'R' && mainModifier && ev.shiftKey;
    if (reload || hardReload) {
      return true;
    } else if (ev.key === 'l' && mainModifier) {
      return true;
    } else if (ev.key === 'C' && mainModifier && ev.shiftKey) {
      return true;
    } else if (ev.key === '=' && mainModifier) {
      return true;
    } else if (ev.key === '-' && mainModifier) {
      return true;
    }

    return false;
  }
}

/**
 * Main concern: Given an input, return the executed command's output
 */
export class VimCore {
  private vimState: VimStateV2 = {};
  private readonly vimCommandManager: VimCommandManager;
  private readonly vimOptions: VimOptions;

  constructor(vimState: VimStateV2 = {}, vimOptions: VimOptions = {}) {
    this.vimState = vimState;
    this.vimOptions = vimOptions;

    this.vimCommandManager = new VimCommandManager();

    // defaults
    this.vimState.mode = VimMode.INSERT;
  }

  public executeCommand(key: string): VimStateV2 | undefined {
    // Old
    const oldMode = this.vimState.mode;
    /* prettier-ignore */ logger.culogger.debug(['Old Mode: %s', oldMode], {}, (...r)=>console.log(...r));

    // Execute
    const updatedVimState = this.vimCommandManager.executeCommand(
      this.vimState,
      key
    );
    if (!updatedVimState) return;
    /* prettier-ignore */ logger.culogger.debug(['updatedVimState: %o', updatedVimState], {}, (...r)=>console.log(...r));

    this.vimOptions.hooks.commandListenerv2({
      vimState: updatedVimState,
      targetCommand: VIM_COMMAND.nothing,
    });

    const newMode = updatedVimState.mode;

    // Hooks: modeChanged
    const hasModeChanged = oldMode !== newMode;
    if (hasModeChanged) {
      /* prettier-ignore */ logger.culogger.debug(['New Mode: %s', newMode], {}, (...r)=>console.log(...r));
      this.vimOptions.hooks.modeChangedv2(
        {
          vimState: updatedVimState,
          targetCommand: VIM_COMMAND.nothing,
        },
        newMode,
        oldMode
      );
    }

    this.setVimState(updatedVimState);
    return updatedVimState;
  }

  public getVimState() {
    return cloneDeep(this.vimState);
  }
  public setVimState(vimState: VimStateV2) {
    this.vimState = vimState;
  }
}

/**
 * - Given input, find command, execute it, and provide result
 */
export class VimCommandManager {
  // constructor(vimState: VimStateV2 = {}) {
  //   this.vimState = cloneDeep(vimState);
  // }

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
