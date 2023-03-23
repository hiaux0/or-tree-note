import { isMac } from 'common/platform/platform-check';
import hotkeys from 'hotkeys-js';
import { SPACE } from 'resources/keybindings/app-keys';
import { Modifier } from 'resources/keybindings/key-bindings';

import { Vim } from './vim/vim';
import { QueueInputReturn, Cursor, VimMode } from './vim/vim-types';
import { isModeChangeCommand } from './vim/vim-utils';

export interface InputData {
  pressedKey: string;
  ev: KeyboardEvent;
  modifiersText: string;
}

export type CommandListener = (
  vimResults: QueueInputReturn,
  inputData?: InputData
) => void;
export type ModeChanged = (newMode: VimMode) => void;

export interface VimHtmlOptions {
  commandListener: CommandListener;
  modeChanged?: ModeChanged;
  afterInit?: (
    vim: Vim
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
}

/**
 * Make Vim engine available for HTML usage
 */
export async function initVimHtml(vimHtmlOptions: VimHtmlOptions) {
  const startCursor: Cursor = { col: 0, line: 0 };
  const vim = new Vim([{ text: '123' }, { text: 'abc' }], startCursor, {
    vimPlugins: [],
  });
  const { commandListener, modeChanged, afterInit } = vimHtmlOptions;

  initKeys();
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

  function initKeys() {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 56 ~ initKeys');
    hotkeys('*', (ev) => {
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-html.ts ~ line 56 ~ ev', ev);
      if (checkAllowedBrowserShortcuts(ev)) {
        return;
      }

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
      const result = executeCommandInEditor(pressedKey, ev, collectedModifiers);
      if (result == null) return;

      if (isModeChangeCommand(result.targetCommand)) {
        modeChanged(result.vimState.mode);
      } else {
        commandListener(result, { pressedKey, ev, modifiersText: modifiers });
      }
    });
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

    ev.preventDefault();
    return false;
  }

  function executeCommandInEditor(
    input: string,
    ev: KeyboardEvent,
    modifiers: string[]
  ) {
    const result = vim.queueInput(input, modifiers);
    ev.preventDefault();

    return result;
  }
}
