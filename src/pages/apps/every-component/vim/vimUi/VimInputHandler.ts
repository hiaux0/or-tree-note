import { Logger } from '../../../../../common/logging/logging';
import { isMac } from '../../../../../common/platform/platform-check';
import {
  VimEditorOptionsV2,
  VimMode,
  VimLine,
} from '../../../../../modules/vim/vim-types';
import { VimCoreV2, testVimState } from '../vimCore/VimCoreV2';

const logger = new Logger('VimInputHandler');

/**
 * Handle input and provide an API to interact with the result
 */
export class VimInputHandler {
  vimCore: VimCoreV2;
  container: HTMLElement;
  vimEditorOptions: VimEditorOptionsV2;

  constructor(vimEditorOptions: VimEditorOptionsV2) {
    const lines = this.getTextFromChildren(vimEditorOptions);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:46 ~ lines:', lines);
    const finalVimState = lines.length > 0 ? { lines } : testVimState;

    this.vimCore = new VimCoreV2(finalVimState, {
      hooks: {
        modeChangedv2: (vimResults, newMode, oldMode) => {
          vimEditorOptions.modeChangedv2(vimResults, newMode, oldMode);
        },
        commandListenerv2: (vimResults) => {
          if (this.vimCore.getVimState().mode === VimMode.INSERT) {
            requestAnimationFrame(() => {
              /* prettier-ignore */ logger.culogger.todo('update insert to normal', (...r)=>console.log(...r));
              const lines = this.getTextFromChildren(vimEditorOptions);
              /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:60 ~ lines:', lines);
              const vimState = this.vimCore.getVimState();
              vimState.lines = lines;
              this.vimCore.setVimState(vimState);

              // update cursor

              vimResults.vimState = vimState;
              vimEditorOptions.commandListenerv2(vimResults);
            });
          }
        },
      },
    });

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
      this.vimCore.executeCommand(ev.key);
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
