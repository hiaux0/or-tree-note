import { isMac } from 'common/platform/platform-check';
import hotkeys from 'hotkeys-js';
import { SPACE } from 'resources/keybindings/app-keys';

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
  inputData: InputData
) => void;
export type ModeChanged = (newMode: VimMode) => void;

export interface VimHtmlOptions {
  commandListener: CommandListener;
  modeChanged?: ModeChanged;
}

/**
 * Make Vim engine available for HTML usage
 */
export function initVimHtml(vimHtmlOptions: VimHtmlOptions) {
  const startCursor: Cursor = { col: 0, line: 0 };
  const vim = new Vim(['123', 'abc'], startCursor, {
    vimPlugins: [],
  });

  initKeys(vimHtmlOptions);

  function initKeys(vimHtmlOptions: VimHtmlOptions) {
    const { commandListener, modeChanged } = vimHtmlOptions;

    hotkeys('*', (ev) => {
      if (checkAllowedBrowserShortcuts(ev)) {
        return;
      }

      let pressedKey: string;
      if (ev.code === SPACE) {
        pressedKey = ev.code;
      } else {
        pressedKey = ev.key;
      }

      const modifiers = `${ev.ctrlKey ? 'Ctrl+' : ''}${
        ev.shiftKey ? 'Shift+' : ''
      }${ev.altKey ? 'Alt+' : ''}${ev.metaKey ? 'Meta+' : ''}`;

      const result = executeCommandInEditor(pressedKey, ev);
      if (result == null) return;

      if (isModeChangeCommand(result.targetCommand)) {
        modeChanged(result.vimState.mode);
      } else {
        commandListener(result, { pressedKey, ev, modifiersText: modifiers });
      }
    });
  }

  function checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
    const mainModifier = isMac ? ev.metaKey : ev.ctrlKey;
    const reload = ev.key === 'r' && mainModifier;
    const hardReload = ev.key === 'R' && mainModifier && ev.shiftKey;
    if (reload || hardReload) {
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

  function executeCommandInEditor(input: string, ev: KeyboardEvent) {
    const result = vim.queueInput(input);
    ev.preventDefault();

    return result;
  }
}
