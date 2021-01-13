import "aurelia-polyfills";
import { Vim, VimMode } from "modules/vim/vim";
import { VimEditorOptions } from "./vim-editor";
import hotkeys from "hotkeys-js";
import { Logger } from "modules/debug/logger";
import {
  ESCAPE,
  INSERT_MODE,
  MODIFIERS,
  ModifiersType,
} from "resources/keybindings/app.keys";
import { NormalTextMode } from "./normal-text-mode/normal-text-mode";
import { InsertTextMode } from "./insert-text-mode/insert-text-mode";
import { AbstractTextMode } from "./abstract-text-mode";

const logger = new Logger({ scope: "VimEditorTextMode" });

const CARET_NORMAL_CLASS = "caret-NORMAL";
const CARET_INSERT_CLASS = "caret-INSERT";

export class VimEditorTextMode {
  childrenElementList: NodeListOf<HTMLElement>;
  elementText: string[] = [];
  vim: Vim;

  getCurrentTextMode: () => AbstractTextMode;

  constructor(public vimEditorOptions: VimEditorOptions) {
    const normalTextMode = new NormalTextMode(
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0]
    );
    const insertTextMode = new InsertTextMode(
      this.vimEditorOptions.parentHtmlElement,
      this.vimEditorOptions.childSelectors[0],
      this.vimEditorOptions.caretElements[0]
    );

    this.getCurrentTextMode = () => {
      if (this.vim.getCurrentMode().currentMode === VimMode.INSERT) {
        return insertTextMode;
      } else if (this.vim.getCurrentMode().currentMode === VimMode.NORMAL) {
        return insertTextMode;
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
    this.vim = new Vim(this.elementText);
  }

  initKeys() {
    hotkeys("*", (ev) => {
      logger.debug(["-------------- Key pressed: %s", ev.key], {
        log: true,
      });

      //
      if (
        ev.key === INSERT_MODE &&
        this.vim.getCurrentMode().currentMode === VimMode.NORMAL
      ) {
        this.vimEditorOptions.caretElements[0].classList.remove(
          CARET_NORMAL_CLASS
        );
        this.vimEditorOptions.caretElements[0].classList.add(
          CARET_INSERT_CLASS
        );
      } else if (ev.key === ESCAPE) {
        this.vimEditorOptions.caretElements[0].classList.remove(
          CARET_INSERT_CLASS
        );
        this.vimEditorOptions.caretElements[0].classList.add(
          CARET_NORMAL_CLASS
        );
      }

      this.executeCommandInEditor(ev.key);
    });
  }

  isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return MODIFIERS.includes(modifierInput);
  }

  executeCommandInEditor(input: string) {
    //
    const result = this.vim.queueInput(input);

    //
    const currentMode = this.getCurrentTextMode();

    if (currentMode[result.targetCommand]) {
      currentMode[result.targetCommand](result.vimState);
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
