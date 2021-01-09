import { AbstractMode } from "./../abstract-mode";
import {
  CURSOR_UP,
  CURSOR_DOWN,
  INSERT_MODE,
} from "../../../resources/keybindings/app.keys";

import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  ESCAPE,
} from "../../../resources/keybindings/app.keys";
import { getCssVar, getValueFromPixelString } from "../../css/css-variables";
import hotkeys from "hotkeys-js";
import { insert, replaceAt } from "modules/string/string";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

export class InsertMode extends AbstractMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }

  keyPressed(pressedKey: string, targetCommandName?: string) {
    if (targetCommandName) {
      super[targetCommandName]();
      return;
    }
    this.type(pressedKey);
  }

  modifierKeyPressed(modifierKey: string) {
    if (this[modifierKey.toLowerCase()]) {
      this[modifierKey.toLowerCase()]();
    }
  }

  backspace() {
    const currentLine = this.children[this.currentLineNumber];
    const curLineText = currentLine.textContent;
    const currentCaretCol = this.getCurrentCaretCol();

    const result = replaceAt(curLineText, currentCaretCol - 1, "");
    currentLine.textContent = result;

    super.cursorLeft();
  }

  delete() {
    const currentLine = this.children[this.currentLineNumber];
    const curLineText = currentLine.textContent;
    const currentCaretCol = this.getCurrentCaretCol();

    const result = replaceAt(curLineText, currentCaretCol, "");
    currentLine.textContent = result;
  }

  type(pressedKey: string) {
    const currentLine = this.children[this.currentLineNumber];
    const curLineText = currentLine.textContent;

    const currentCaretCol = this.getCurrentCaretCol();

    const result = insert(curLineText, currentCaretCol, pressedKey);
    currentLine.textContent = result;
    super.cursorRight();
  }
}
