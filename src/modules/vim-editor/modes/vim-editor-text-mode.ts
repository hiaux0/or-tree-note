import 'aurelia-polyfills';
import { connectTo, StateHistory, Store } from 'aurelia-store';
import { isMac } from 'common/platform/platform-check';
import { getRandomId } from 'common/random';
import hotkeys from 'hotkeys-js';
import { Logger } from 'modules/debug/logger';
import { Vim } from 'modules/vim/vim';
import {
  Cursor,
  EMPTY_VIM_LINE,
  VimLine,
  VimMode,
} from 'modules/vim/vim-types';
import {
  ALL_MODIFIERS,
  ModifiersType,
  SPACE,
} from 'resources/keybindings/app-keys';
import { Modifier } from 'resources/keybindings/key-bindings';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { EditorIds, VimEditorState } from 'store/initial-state';

import {
  changeManyText,
  changeText,
  changeVimState,
} from '../actions/actions-vim-editor';
import { VimEditorOptions } from '../vim-editor';
import { AbstractTextMode } from './abstract-text-mode';
import { InsertTextMode } from './insert-text-mode';
import { NormalTextMode } from './normal-text-mode';
import { VisualLineTextMode } from './visual-line-text-mode';
import { VisualTextMode } from './visual-text-mode';

const logger = new Logger({ scope: 'VimEditorTextMode' });

@connectTo<StateHistory<VimEditorState>>({
  selector: {
    activeEditorIds: (store) =>
      store.state.pipe(
        map((x) => x.present.activeEditorIds),
        distinctUntilChanged()
      ),
  },
})
export class VimEditorTextMode {
  childrenElementList: NodeListOf<HTMLElement>;
  elementText: VimLine[] = [EMPTY_VIM_LINE];
  vim: Vim;

  private activeEditorIds: EditorIds;

  getCurrentTextMode: () => AbstractTextMode;

  /**
   * Injected in vim-notes.ts
   */
  constructor(
    public vimEditorOptions: VimEditorOptions,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    store.registerAction('changeText', changeText);
    store.registerAction('changeManyText', changeManyText);
    store.state
      .pipe(
        map((x) => x.present.activeEditorIds),
        distinctUntilChanged()
      )
      .subscribe((activeEditorIds) => {
        this.activeEditorIds = activeEditorIds;
      });

    const normalTextMode = new NormalTextMode(
      this.vimEditorOptions.id,
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );
    const insertTextMode = new InsertTextMode(
      this.vimEditorOptions.id,
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );
    const visualTextMode = new VisualTextMode(
      this.vimEditorOptions.id,
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0],
      store
    );
    const visualLineTextMode = new VisualLineTextMode(
      this.vimEditorOptions.id,
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
      } else if (this.vim.getCurrentMode().currentMode === VimMode.VISUALLINE) {
        return visualLineTextMode;
      }
    };
  }

  public setupElementMode() {
    this.childrenElementList =
      this.vimEditorOptions.parentHtmlElement.querySelectorAll<HTMLElement>(
        `.${this.vimEditorOptions.childSelectors[0]}`
      );

    this.childrenElementList.forEach((childElement) => {
      this.elementText.push({ text: childElement.textContent });
    });
  }

  public initVim() {
    this.store.state
      .pipe(
        map((x) => x.present.editors[this.vimEditorOptions.id]?.vimState),
        filter((val) => {
          return !!val;
        }),
        take(1)
      )
      .subscribe((vimState) => {
        const cursorPosition = vimState?.cursor;
        const startCursor: Cursor = { col: 0, line: 0 };
        const shouldCursor = cursorPosition || startCursor;

        const initLines = vimState.lines?.length
          ? vimState.lines
          : this.elementText;

        // Migration_1
        initLines.forEach((line) => {
          if (!line.id) {
            line.id = getRandomId();
          }
        });

        this.vim = new Vim(initLines, shouldCursor, {
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

  public initKeys() {
    hotkeys('*', (ev) => {
      if (!this.activeEditorIds.includes(this.vimEditorOptions.id)) return;
      console.clear();

      if (this.checkAllowedBrowserShortcuts(ev)) {
        return;
      }

      let pressedKey: string;
      if (ev.code === SPACE) {
        pressedKey = ev.code;
      } else {
        pressedKey = ev.key;
      }

      const modifiersText = `${ev.ctrlKey ? 'Ctrl+' : ''}${
        ev.shiftKey ? 'Shift+' : ''
      }${ev.altKey ? 'Alt+' : ''}${ev.metaKey ? 'Meta+' : ''}`;
      // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: vim-editor-text-mode.ts ~ line 133 ~ ev.key', ev.key);
      /* prettier-ignore */ logger.debug(['-------------- Key pressed: (%s) %s', modifiersText, ev.key ?? pressedKey], { log: true, isOnlyGroup: true, });

      const collectedModifiers = [];
      if (ev.ctrlKey) {
        collectedModifiers.push(Modifier['<Control>']);
      }
      if (ev.shiftKey) {
        collectedModifiers.push(Modifier['<Shift>']);
      }
      if (ev.altKey) {
        collectedModifiers.push(Modifier['<Alt>']);
      }
      if (ev.metaKey) {
        collectedModifiers.push(Modifier['<Meta>']);
      }

      void this.executeCommandInEditor(pressedKey, ev, collectedModifiers);
    });
  }

  isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return ALL_MODIFIERS.includes(modifierInput);
  }

  async executeCommandInEditor(
    input: string,
    ev: KeyboardEvent,
    modifiers: string[]
  ) {
    //
    const result = await this.vim.queueInput(input, modifiers);
    if (result == null) {
      return;
    }
    logger.debug(['Received result from vim: %o', result], {
      onlyVerbose: true,
    });

    //
    const currentMode = this.getCurrentTextMode();
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

    await this.store.dispatch(
      changeVimState,
      this.vimEditorOptions.id,
      result.vimState
    );
  }

  async executeCommandSequenceInEditor(inputSequence: string | string[]) {
    logger.bug('executeCommandSequenceInEditor');
    const resultList = await this.vim.queueInputSequence(
      inputSequence,
      this.vimEditorOptions.vimExecutingMode
    );
    resultList.forEach((result) => {
      const currentMode = this.getCurrentTextMode();

      /* prettier-ignore */ console.log('TCL ~ file: vim-editor-text-mode.ts ~ line 180 ~ VimEditorTextMode ~ resultList.forEach ~ result.targetCommand', result.targetCommand);
      if (currentMode[result.targetCommand] != null) {
        currentMode[result.targetCommand](result.vimState);
      }
    });
  }

  public getVim() {
    return this.vim;
  }
}
