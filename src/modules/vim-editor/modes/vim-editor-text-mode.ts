import 'aurelia-polyfills';
import { StateHistory, Store } from 'aurelia-store';
import { isMac } from 'common/platform/platform-check';
import hotkeys from 'hotkeys-js';
import { Logger } from 'modules/debug/logger';
import { Vim } from 'modules/vim/vim';
import { Cursor, VimLine, VimMode } from 'modules/vim/vim-types';
import {
  ALL_MODIFIERS,
  ModifiersType,
  SPACE,
} from 'resources/keybindings/app-keys';
import { pluck, take } from 'rxjs/operators';
import { VimEditorState } from 'store/initial-state';

import { changeText, changeVimState } from '../actions/actions-vim-editor';
import { VimEditorOptions } from '../vim-editor';
import { AbstractTextMode } from './abstract-text-mode';
import { InsertTextMode } from './insert-text-mode';
import { NormalTextMode } from './normal-text-mode';
import { VisualTextMode } from './visual-text-mode';

const logger = new Logger({ scope: 'VimEditorTextMode' });

export class VimEditorTextMode {
  childrenElementList: NodeListOf<HTMLElement>;
  elementText: VimLine[] = [];
  vim: Vim;

  getCurrentTextMode: () => AbstractTextMode;

  /**
   * Injected in or-tree-notes.ts
   */
  constructor(
    public vimEditorOptions: VimEditorOptions,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    store.registerAction('changeText', changeText);

    const normalTextMode = new NormalTextMode(
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );
    const insertTextMode = new InsertTextMode(
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );
    const visualTextMode = new VisualTextMode(
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );

    this.getCurrentTextMode = () => {
      if (this.vim.getCurrentMode().currentMode === VimMode.INSERT) {
        return insertTextMode;
      } else if (this.vim.getCurrentMode().currentMode === VimMode.NORMAL) {
        return normalTextMode;
      } else if (this.vim.getCurrentMode().currentMode === VimMode.VISUAL) {
        return visualTextMode;
      }
    };
  }

  setupElementMode() {
    this.childrenElementList =
      this.vimEditorOptions.parentHtmlElement.querySelectorAll<HTMLElement>(
        `.${this.vimEditorOptions.childSelectors[0]}`
      );

    this.childrenElementList.forEach((childElement) => {
      this.elementText.push({ text: childElement.textContent });
    });
  }

  initVim() {
    this.store.state
      .pipe(pluck('present', 'vimState', 'cursor'), take(1))
      .subscribe((cursorPosition) => {
        const startCursor: Cursor = { col: 0, line: 0 };
        const shouldCursor = cursorPosition || startCursor;

        this.vim = new Vim(this.elementText, shouldCursor, {
          vimPlugins: this.vimEditorOptions.plugins,
        });

        this.getCurrentTextMode().setCursorMovement(cursorPosition);
      });
  }

  checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
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

  initKeys() {
    hotkeys('*', (ev) => {
      console.clear();
      if (this.checkAllowedBrowserShortcuts(ev)) {
        return;
      }

      let pressedKey: string;
      if (ev.code === SPACE) {
        pressedKey = ev.code;
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor-text-mode.ts ~ line 124 ~ pressedKey', pressedKey);
      } else {
        pressedKey = ev.key;
      }

      const modifiers = `${ev.ctrlKey ? 'Ctrl+' : ''}${
        ev.shiftKey ? 'Shift+' : ''
      }${ev.altKey ? 'Alt+' : ''}${ev.metaKey ? 'Meta+' : ''}`;
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor-text-mode.ts ~ line 133 ~ ev.key', ev.key);
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor-text-mode.ts ~ line 136 ~ pressedKey', pressedKey);
      /* prettier-ignore */ logger.debug(['-------------- Key pressed: (%s) %s', modifiers, ev.key ?? pressedKey], { log: true, isOnlyGroup: true, });

      void this.executeCommandInEditor(pressedKey, ev);
    });
  }

  isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return ALL_MODIFIERS.includes(modifierInput);
  }

  async executeCommandInEditor(input: string, ev: KeyboardEvent) {
    //
    const result = this.vim.queueInput(input);
    logger.debug(['Received result from vim: %o', result], {
      onlyVerbose: true,
    });

    //
    const currentMode = this.getCurrentTextMode();

    if (result == null) {
      return;
    }

    if (currentMode[result?.targetCommand]) {
      await currentMode[result.targetCommand](result.vimState);
      ev.preventDefault();
    } else {
      logger.debug([
        `The mode ${this.vim.getCurrentMode().currentMode} has no command ${
          result.targetCommand
        }.`,
      ]);
    }

    await this.store.dispatch(changeVimState, result.vimState);
  }

  executeCommandSequenceInEditor(inputSequence: string | string[]) {
    logger.bug('executeCommandSequenceInEditor');
    const resultList = this.vim.queueInputSequence(
      inputSequence,
      this.vimEditorOptions.vimExecutingMode
    );
    resultList.forEach((result) => {
      /* prettier-ignore */ console.log('TCL ~ file: vim-editor-text-mode.ts ~ line 178 ~ VimEditorTextMode ~ resultList.forEach ~ result', result);
      const currentMode = this.getCurrentTextMode();

      /* prettier-ignore */ console.log('TCL ~ file: vim-editor-text-mode.ts ~ line 180 ~ VimEditorTextMode ~ resultList.forEach ~ result.targetCommand', result.targetCommand);
      if (currentMode[result.targetCommand] != null) {
        currentMode[result.targetCommand](result.vimState);
      }
    });
  }

  getVim() {
    return this.vim;
  }
}
