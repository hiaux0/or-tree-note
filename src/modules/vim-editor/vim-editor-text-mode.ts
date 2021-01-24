import { take } from "rxjs/operators";
import "aurelia-polyfills";
import { Vim } from "modules/vim/vim";
import { Cursor, VimMode } from "modules/vim/vim.types";
import { VimEditorOptions } from "./vim-editor";
import hotkeys from "hotkeys-js";
import { Logger } from "modules/debug/logger";
import {
  ESCAPE,
  INSERT_MODE,
  MODIFIERS,
  ModifiersType,
  SPACE,
} from "resources/keybindings/app.keys";
import { NormalTextMode } from "./normal-text-mode/normal-text-mode";
import { InsertTextMode } from "./insert-text-mode/insert-text-mode";
import { AbstractTextMode } from "./abstract-text-mode";
import { StateHistory, Store } from "aurelia-store";
import { VimEditorState } from "store/initial-state";
import { changeText } from "./actions/actions-vim-editor";
import { pluck } from "rxjs/operators";

const logger = new Logger({ scope: "VimEditorTextMode" });

const CARET_NORMAL_CLASS = "caret-NORMAL";
const CARET_INSERT_CLASS = "caret-INSERT";

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
    store.registerAction("changeText", changeText);

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
    this.getCurrentTextMode = () => {
      if (this.vim.getCurrentMode().currentMode === VimMode.INSERT) {
        return insertTextMode;
      } else if (this.vim.getCurrentMode().currentMode === VimMode.NORMAL) {
        return normalTextMode;
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
      .pipe(pluck("present", "cursorPosition"), take(1))
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
    if (ev.key === "r" && ev.ctrlKey) {
      return;
    }

    ev.preventDefault();
  }

  initKeys() {
    hotkeys("*", (ev) => {
      this.checkAllowedBrowserShortcuts(ev);

      let pressedKey: string;
      if (ev.code === SPACE) {
        pressedKey = ev.code;
      } else {
        pressedKey = ev.key;
      }

      logger.debug(["-------------- Key pressed: %s", ev.key], {
        log: true,
        isOnlyGroup: true,
      });

      //
      if (
        pressedKey === INSERT_MODE &&
        this.vim.getCurrentMode().currentMode === VimMode.NORMAL
      ) {
        this.vimEditorOptions.caretElements[0].classList.remove(
          CARET_NORMAL_CLASS
        );
        this.vimEditorOptions.caretElements[0].classList.add(
          CARET_INSERT_CLASS
        );
      } else if (pressedKey === ESCAPE) {
        this.vimEditorOptions.caretElements[0].classList.remove(
          CARET_INSERT_CLASS
        );
        this.vimEditorOptions.caretElements[0].classList.add(
          CARET_NORMAL_CLASS
        );
      }

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
    logger.debug(["Received result from vim: %o", result], {
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
