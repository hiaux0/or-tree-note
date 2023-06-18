import { cloneDeep } from 'lodash';

import { Logger } from '../../../../../common/logging/logging';
import { CursorUtils } from '../../../../../modules/cursor/cursor-utils';
import { VIM_COMMAND } from '../../../../../modules/vim/vim-commands-repository';
import { assembleModifiers } from '../../../../../modules/vim/vim-init';
import {
  VimEditorOptionsV2,
  VimMode,
  VimLine,
  VimStateV2,
} from '../../../../../modules/vim/vim-types';
import { isModeChangeCommand } from '../../../../../modules/vim/vim-utils';
import { ShortcutService } from '../../shortcuts/ShortcutService';
import { VimCoreV2, testVimState } from '../vimCore/VimCoreV2';
import { VimUiV2 } from './VimUiV2';

const logger = new Logger('VimInputHandler');

/**
 * Handle input and provide an API to interact with the result
 */
export class VimInputHandler {
  private readonly container: HTMLElement;
  private vimCore: VimCoreV2;
  private vimUi: VimUiV2;

  constructor(private readonly vimEditorOptions: VimEditorOptionsV2) {
    this.container = this.vimEditorOptions.container;

    void this.init();
  }

  private async init() {
    this.initVimCore();
    this.vimUi = new VimUiV2(this.vimCore, this.vimEditorOptions);

    this.initEventListeners();
    await this.afterInitVimCore();
  }

  private initVimCore() {
    const lines = this.getTextFromChildren(this.vimEditorOptions);
    const finalVimState = testVimState;
    if (lines.length > 0) {
      finalVimState.lines = lines;
    }

    this.vimCore = new VimCoreV2(finalVimState, {
      hooks: {
        afterInitv2: (vimCore) => {
          void this.vimEditorOptions.afterInitv2(vimCore);
          void vimCore.queueInputSequence('ll');
        },
        modeChangedv2: (vimResults, newMode, oldMode) => {
          this.vimEditorOptions.modeChangedv2(vimResults, newMode, oldMode);

          if (newMode === VimMode.NORMAL) {
            this.vimUi.enterNormalModeV2(this.vimCore.getVimState());
          }
        },
        commandListenerv2: (vimResult) => {
          if (this.vimCore.getVimState().mode === VimMode.INSERT) {
            const vimState = this.updateVimStateFromInsert(
              this.vimEditorOptions
            );

            vimResult.vimState = vimState;
          }
          this.vimEditorOptions.commandListenerv2(vimResult);
          this.vimUi.update(vimResult.vimState);
        },
      },
    });
  }

  private async afterInitVimCore() {
    if (this.vimEditorOptions.afterInitv2) {
      const afterResults = await this.vimEditorOptions.afterInitv2(
        this.vimCore
      );

      if (afterResults) {
        afterResults.forEach((vimResult) => {
          if (isModeChangeCommand(vimResult.targetCommand)) {
            const updatedVimState = this.vimEditorOptions.modeChangedv2(
              vimResult,
              vimResult.vimState.mode,
              undefined,
              this.vimCore
            );
            if (updatedVimState) {
              this.vimCore.setVimState(updatedVimState);
            }
          } else {
            const updatedVimState =
              this.vimEditorOptions.commandListenerv2(vimResult);
            if (updatedVimState) {
              this.vimCore.setVimState(updatedVimState);
            }
          }
          this.vimUi.update(vimResult.vimState);
          this.vimCore.setVimState(vimResult.vimState);
        });
      }
    }
  }

  private initEventListeners() {
    this.initKeyListeners();
    this.initMouseListeners();
  }

  private initKeyListeners() {
    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      console.clear();
      if (ShortcutService.checkAllowedBrowserShortcuts(ev)) return;
      // ev.preventDefault();
      /* prettier-ignore */ logger.culogger.debug(['Received input %s', ev.key], {}, (...r) => console.log(...r));

      const { collectedModifiers } = ShortcutService.assembleModifiers(ev);
      const pressedKey = ShortcutService.getPressedKey(ev);

      requestAnimationFrame(() => {
        void this.vimCore.executeCommand(
          this.vimCore.getVimState(),
          pressedKey,
          collectedModifiers
        );
        this.handleNormalMode();
      });
    });
  }

  private handleNormalMode() {
    /** Needed, else cursor not updating */
    requestAnimationFrame(() => {
      this.vimUi.enterInsertMode();
    });
  }

  private initMouseListeners() {
    this.container.addEventListener('click', () => {
      console.clear();
      const vimState = this.vimCore.getVimState();
      const updatedWithCursor = this.updateCursor(vimState);
      this.vimCore.setVimState(updatedWithCursor);
      this.vimUi.update(updatedWithCursor);

      const vimResults = {
        vimState: updatedWithCursor,
        targetCommand: VIM_COMMAND.click,
      };
      this.vimEditorOptions.commandListenerv2(vimResults);
    });
  }

  private updateVimStateFromInsert(vimEditorOptions: VimEditorOptionsV2) {
    const lines = this.getTextFromChildren(vimEditorOptions);
    const vimState = this.vimCore.getVimState();
    vimState.lines = lines;
    const updateWithCursor = this.updateCursor(vimState);
    this.vimCore.setVimState(updateWithCursor);
    return updateWithCursor;
  }

  private updateCursor(vimState: VimStateV2) {
    const newVimMode = cloneDeep(vimState);
    const selection = document.getSelection();
    for (let rangeIndex = 0; rangeIndex < selection.rangeCount; rangeIndex++) {
      const range = selection.getRangeAt(rangeIndex);
      const col = range.startOffset;
      const line = getLineIndex(this.container, range.startContainer);

      const updatedVimState = CursorUtils.updateCursorV2(vimState, {
        line,
        col,
      });
      newVimMode.cursor = updatedVimState.cursor;
    }

    return newVimMode;
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

function getLineIndex(parent: Element, textNode: Node): number {
  const $children = Array.from(parent.children);
  const parentOfTextNode = textNode.parentElement;
  const positionIndex = $children.indexOf(parentOfTextNode);
  return positionIndex;
}
