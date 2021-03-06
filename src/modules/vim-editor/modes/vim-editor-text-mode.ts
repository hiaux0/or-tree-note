import 'aurelia-polyfills';
import { StateHistory, Store } from 'aurelia-store';
import { pluck, take } from 'rxjs/operators';
import hotkeys from 'hotkeys-js';

import { Vim } from 'modules/vim/vim';
import { Cursor, VimMode } from 'modules/vim/vim.types';
import { Logger } from 'modules/debug/logger';
import {
  MODIFIERS,
  ModifiersType,
  SPACE,
} from 'resources/keybindings/app.keys';
import { VimEditorState } from 'store/initial-state';

import { AbstractTextMode } from './abstract-text-mode';
import { NormalTextMode } from './normal-text-mode';
import { InsertTextMode } from './insert-text-mode';
import { VisualTextMode } from './visual-text-mode';
import { VimEditorOptions } from '../vim-editor';
import { changeText, changeVimState } from '../actions/actions-vim-editor';

const logger = new Logger({ scope: 'VimEditorTextMode' });

export class VimEditorTextMode {
  childrenElementList: NodeListOf<HTMLElement>;
  elementText: string[] = [];
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
    this.childrenElementList = this.vimEditorOptions.parentHtmlElement.querySelectorAll<HTMLElement>(
      `.${this.vimEditorOptions.childSelectors[0]}`
    );

    this.childrenElementList.forEach((childElement) => {
      this.elementText.push(childElement.textContent);
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
    if (ev.key === 'r' && ev.ctrlKey) {
      return;
    } else if (ev.key === 'C' && ev.ctrlKey && ev.shiftKey) {
      return;
    } else if (ev.key === '-' && ev.ctrlKey) {
      return;
    } else if (ev.key === '+' && ev.ctrlKey) {
      return;
    }

    ev.preventDefault();
  }

  initKeys() {
    hotkeys('*', (ev) => {
      this.checkAllowedBrowserShortcuts(ev);

      let pressedKey: string;
      if (ev.code === SPACE) {
        pressedKey = ev.code;
      } else {
        pressedKey = ev.key;
      }

      logger.debug(['-------------- Key pressed: %s', ev.key], {
        log: true,
        isOnlyGroup: true,
      });

      this.executeCommandInEditor(pressedKey, ev);
    });
  }

  isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return MODIFIERS.includes(modifierInput);
  }

  executeCommandInEditor(input: string, ev: KeyboardEvent) {
    //
    const result = this.vim.queueInput(input);
    logger.debug(['Received result from vim: %o', result], {
      onlyVerbose: true,
    });

    //
    const currentMode = this.getCurrentTextMode();

    if (result === null) {
      return;
    }

    if (currentMode[result?.targetCommand]) {
      currentMode[result.targetCommand](result.vimState);
      ev.preventDefault();
    }

    this.store.dispatch(changeVimState, result.vimState);
  }

  executeCommandSequenceInEditor(inputSequence: string | string[]) {
    const resultList = this.vim.queueInputSequence(
      inputSequence,
      this.vimEditorOptions.vimExecutingMode
    );

    resultList.forEach((result) => {
      const currentMode = this.getCurrentTextMode();

      if (currentMode[result.targetCommand]) {
        currentMode[result.targetCommand](result.vimState);
      }
    });
  }

  getVim() {
    return this.vim;
  }
}
