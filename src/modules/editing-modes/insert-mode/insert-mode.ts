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
import { insert } from "modules/string/string";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

export class InsertMode extends AbstractMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }

  keyPressed(pressedKey: string) {
    this.type(pressedKey);
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
