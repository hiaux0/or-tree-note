import { isMac } from 'common/platform/platform-check';
import { CursorUtils } from 'modules/cursor/cursor-utils';
import { SPACE } from 'resources/keybindings/app-keys';
import { Modifier } from 'resources/keybindings/key-bindings';

import { Vim } from './vim';
import { Cursor, VimEditorOptionsV2, VimLine } from './vim-types';
import { isModeChangeCommand } from './vim-utils';

/**
 * 1. Options
 *   - start cursor
 *   - start lines
 * 2. init key listener
 *   - differentiate between normal and insert mode
 */
export async function initVim(vimEditorOptionsV2: VimEditorOptionsV2) {
  const { startCursor, startLines, commandListener, modeChanged, afterInit } =
    vimEditorOptionsV2;
  // Vim
  const finalCursor: Cursor = startCursor ?? { col: 0, line: 0 };
  const finalLines: VimLine[] = startLines ?? [
    { text: '123' },
    { text: 'abc' },
  ];
  const vim = new Vim(finalLines, finalCursor, {
    vimPlugins: [],
  });
  vim.enterInsertMode();

  //
  await initKeys(vimEditorOptionsV2.container);
  await initMouse(vimEditorOptionsV2.container);

  if (afterInit) {
    const afterResults = await afterInit(vim);

    if (afterResults) {
      afterResults.forEach((result) => {
        if (isModeChangeCommand(result.targetCommand)) {
          modeChanged(result, result.vimState.mode, vim);
        } else {
          commandListener(result, undefined, vim);
        }
      });
    }
  }

  // Key listener
  async function initKeys(container: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hotkeys('*', handleKeys);
    container.addEventListener('keydown', (e) => void handleKeys(e));
  }

  async function handleKeys(ev: KeyboardEvent) {
    if (checkAllowedBrowserShortcuts(ev)) {
      return;
    }

    console.clear();
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 56 ~ ev', ev);

    let pressedKey: string;
    if (ev.code === SPACE) {
      pressedKey = ev.code;
    } else {
      pressedKey = ev.key;
    }

    const { collectedModifiers, modifiers } = assembleModifiers(ev);

    const result = await executeCommandInEditor(
      pressedKey,
      ev,
      collectedModifiers
    );
    if (result == null) return;

    if (isModeChangeCommand(result.targetCommand)) {
      modeChanged(result, result.vimState.mode, vim);
    } else {
      commandListener(
        result,
        { pressedKey, ev, modifiersText: modifiers },
        vim
      );
    }
  }

  /**
   *
   */
  function checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
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

    // ev.preventDefault();
    return false;
  }

  function executeCommandInEditor(
    input: string,
    _ev: KeyboardEvent,
    modifiers: string[]
  ) {
    const result = vim.queueInput(input, modifiers);
    // ev.preventDefault();

    return result;
  }

  async function initMouse(container: HTMLElement) {
    container.addEventListener('click', () => {
      const selection = document.getSelection();
      for (
        let rangeIndex = 0;
        rangeIndex < selection.rangeCount;
        rangeIndex++
      ) {
        const range = selection.getRangeAt(rangeIndex);
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: test-vn-mode.ts ~ line 26 ~ range', range);
        const col = range.startOffset;
        const line = getLineIndex(range.startContainer);

        CursorUtils.updateCursor(vim.vimState, {
          line,
          col,
        });
      }
    });

    function getLineIndex(startContainer: Node): number {
      const $children = Array.from(container.children);
      const positionIndex = $children.indexOf(startContainer.parentElement);
      return positionIndex;
    }
  }
}

export function assembleModifiers(ev: KeyboardEvent) {
  let modifiers = '';
  const collectedModifiers = [];
  if (ev.ctrlKey) {
    modifiers += 'Ctrl+';
    collectedModifiers.push(Modifier['<Control>']);
  }
  if (ev.shiftKey) {
    modifiers += 'Shift+';
    collectedModifiers.push(Modifier['<Shift>']);
  }
  if (ev.altKey) {
    modifiers += 'Alt+';
    collectedModifiers.push(Modifier['<Alt>']);
  }
  if (ev.metaKey) {
    modifiers += 'Meta+';
    collectedModifiers.push(Modifier['<Meta>']);
  }
  return { collectedModifiers, modifiers };
}
