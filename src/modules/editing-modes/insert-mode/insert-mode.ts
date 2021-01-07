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

  cursorLeft() {
    super.cursorLeft();
    const currentCaretLeft = getValueFromPixelString(
      this.caretElement.style.left
    );

    const newLeft = currentCaretLeft - this.caretWidth;

    if (newLeft < 0) {
      return;
    }
    this.caretElement.style.left = `${newLeft}px`;
  }

  cursorRight() {
    console.log("TODO: insert the letter: L");
    const currentLine = this.children[this.currentLineNumber];
    console.log("TCL: InsertMode -> keyL -> currentLine", currentLine);
    const curLineText = currentLine.textContent;

    const currentCaretCol = this.getCurrentCaretCol();

    const result = insert(curLineText, currentCaretCol, "l");
    console.log("TCL: InsertMode -> keyL -> result", result);
    currentLine.textContent = result;
  }

  cursorUp() {
    super.cursorUp();
    const currentCaretTop = getValueFromPixelString(
      this.caretElement.style.top
    );

    const newTop = currentCaretTop - this.caretHeight;
    if (newTop < 0) {
      return;
    }

    this.caretElement.style.top = `${newTop}px`;
  }

  cursorDown() {
    super.cursorDown();
    const currentCaretTop = getValueFromPixelString(
      this.caretElement.style.top
    );

    const newTop = currentCaretTop + this.caretHeight;
    const parentHeight = getValueFromPixelString(
      getComputedStyle(this.parentElement).height
    );
    if (newTop > parentHeight) {
      return;
    }

    this.caretElement.style.top = `${newTop}px`;
  }
}
