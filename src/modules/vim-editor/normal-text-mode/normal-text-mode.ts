import { AbstractTextMode } from "../abstract-text-mode";
import { getValueFromPixelString } from "../../css/css-variables";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

export class NormalTextMode extends AbstractTextMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }

  keyPressed(_pressedKey: string, targetCommandName: string) {
    this[targetCommandName]();
  }

  cursorLeft() {
    super.cursorLeft();
  }

  cursorRight() {
    super.cursorRight();
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
