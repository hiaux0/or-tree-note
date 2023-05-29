import { isMac } from 'common/platform/platform-check';
import hotkeys from 'hotkeys-js';
import { SPACE } from 'resources/keybindings/app-keys';
import { Modifier } from 'resources/keybindings/key-bindings';

import { VimCore } from './vim/vim-core';
import { Cursor, VimEditorOptionsV2 } from './vim/vim-types';
import { isModeChangeCommand } from './vim/vim-utils';

/**
 * Make Vim engine available for HTML usage
 */
export async function initVimHtml(vimHtmlOptions: VimEditorOptionsV2) {
  const startCursor: Cursor = { col: 0, line: 0 };
  const vim = new VimCore([{ text: '123' }, { text: 'abc' }], startCursor, {
    vimPlugins: [],
  });
  vim.enterInsertMode();
  const { commandListener, modeChanged, afterInit } = vimHtmlOptions;

  await initKeys(vimHtmlOptions.container);
  if (afterInit) {
    const afterResults = await afterInit(vim);

    if (afterResults) {
      afterResults.forEach((result) => {
        if (isModeChangeCommand(result.targetCommand)) {
          modeChanged(result, result.vimState.mode, undefined, vim);
        } else {
          commandListener(result, undefined, vim);
        }
      });
    }
  }

  async function initKeys(container: HTMLElement) {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 56 ~ initKeys');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hotkeys('*', handleKeys);
    container.addEventListener('keydown', (e) => void handleKeys(e));
  }

  async function handleKeys(ev: KeyboardEvent) {
    if (checkAllowedBrowserShortcuts(ev)) {
      return;
    }

    // console.clear();
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 56 ~ ev', ev);

    let pressedKey: string;
    if (ev.code === SPACE) {
      pressedKey = ev.code;
    } else {
      pressedKey = ev.key;
    }

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

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 73 ~ pressedKey', pressedKey);
    const result = await executeCommandInEditor(
      pressedKey,
      ev,
      collectedModifiers
    );
    if (result == null) return;

    if (isModeChangeCommand(result.targetCommand)) {
      modeChanged(result, result.vimState.mode, undefined, vim);
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
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 105 ~ checkAllowedBrowserShortcuts');

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
}
