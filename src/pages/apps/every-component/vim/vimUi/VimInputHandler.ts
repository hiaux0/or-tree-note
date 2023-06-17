import { Logger } from '../../../../../common/logging/logging';
import { CursorUtils } from '../../../../../modules/cursor/cursor-utils';
import { VIM_COMMAND } from '../../../../../modules/vim/vim-commands-repository';
import {
  VimEditorOptionsV2,
  VimMode,
  VimLine,
  VimStateV2,
} from '../../../../../modules/vim/vim-types';
import { ShortcutService } from '../../shortcuts/ShortcutService';
import { VimCoreV2, testVimState } from '../vimCore/VimCoreV2';

const logger = new Logger('VimInputHandler');

/**
 * Handle input and provide an API to interact with the result
 */
export class VimInputHandler {
  vimCore: VimCoreV2;
  container: HTMLElement;

  constructor(private readonly vimEditorOptions: VimEditorOptionsV2) {
    this.container = this.vimEditorOptions.container;

    this.init();
  }

  private init() {
    this.initVimCore();
    this.initEventListeners();
  }

  private initVimCore() {
    const lines = this.getTextFromChildren(this.vimEditorOptions);
    const finalVimState = testVimState;
    if (lines.length > 0) {
      finalVimState.lines = lines;
    }

    this.vimCore = new VimCoreV2(finalVimState, {
      hooks: {
        modeChangedv2: (vimResults, newMode, oldMode) => {
          this.vimEditorOptions.modeChangedv2(vimResults, newMode, oldMode);
        },
        commandListenerv2: (vimResults) => {
          if (this.vimCore.getVimState().mode === VimMode.INSERT) {
            /* prettier-ignore */ logger.culogger.todo('update insert to normal', (...r) => console.log(...r));
            const vimState = this.updateVimState(this.vimEditorOptions);

            vimResults.vimState = vimState;
            this.vimEditorOptions.commandListenerv2(vimResults);
          }
        },
      },
    });
  }

  private initEventListeners() {
    this.initKeyListeners();
    this.initMouseListeners();
  }

  private initKeyListeners() {
    this.container.addEventListener('keydown', (ev) => {
      console.clear();
      if (ShortcutService.checkAllowedBrowserShortcuts(ev)) return;

      // ev.preventDefault();
      /* prettier-ignore */ logger.culogger.debug(['Received input %s', ev.key], {}, (...r) => console.log(...r));
      /** Let ev paint the DOM first, so we can get the (nativly) updated DOM with keydown */
      requestAnimationFrame(() => {
        this.vimCore.executeCommand(ev.key);
      });
    });
  }

  private initMouseListeners() {
    this.container.addEventListener('click', () => {
      console.clear();
      const vimState = this.vimCore.getVimState();
      this.updateCursor(vimState);
      this.vimCore.setVimState(vimState);

      const vimResults = {
        vimState,
        targetCommand: VIM_COMMAND.nothing,
      };
      this.vimEditorOptions.commandListenerv2(vimResults);
    });
  }

  private updateVimState(vimEditorOptions: VimEditorOptionsV2) {
    const lines = this.getTextFromChildren(vimEditorOptions);
    const vimState = this.vimCore.getVimState();
    vimState.lines = lines;
    this.updateCursor(vimState);
    this.vimCore.setVimState(vimState);
    return vimState;
  }

  private updateCursor(vimState: VimStateV2) {
    const selection = document.getSelection();
    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      const col = range.startOffset;
      const line = getLineIndex(this.container, range.startContainer);

      const updatedVimState = CursorUtils.updateCursorV2(vimState, {
        line,
        col,
      });

      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: VimInputHandler.ts:81 ~ updatedVimState.cursor:', updatedVimState.cursor);

      vimState.cursor = updatedVimState.cursor;
    }
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
}

function getLineIndex(parent: Element, startContainer: Node): number {
  const $children = Array.from(parent.children);
  const positionIndex = $children.indexOf(startContainer.parentElement);
  return positionIndex;
}
