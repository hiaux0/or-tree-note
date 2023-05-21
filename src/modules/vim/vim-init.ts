import { isMac } from 'common/platform/platform-check';
import { SPACE } from 'resources/keybindings/app-keys';
import { Modifier } from 'resources/keybindings/key-bindings';

import { Vim } from './vim';
import { Cursor, VimEditorOptions, VimLine } from './vim-types';
import { isModeChangeCommand } from './vim-utils';

export async function initVim(vimEditorOptions: VimEditorOptions) {
  const { startCursor, startLines, commandListener, modeChanged, afterInit } =
    vimEditorOptions;
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
  await initKeys(vimEditorOptions.container);
  if (afterInit) {
    const afterResults = await afterInit(vim);

    if (afterResults) {
      afterResults.forEach((result) => {
        if (isModeChangeCommand(result.targetCommand)) {
          modeChanged(result.vimState.mode);
        } else {
          commandListener(result);
        }
      });
    }
  }

  // Key listener
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
      modeChanged(result.vimState.mode);
    } else {
      commandListener(result, { pressedKey, ev, modifiersText: modifiers });
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
