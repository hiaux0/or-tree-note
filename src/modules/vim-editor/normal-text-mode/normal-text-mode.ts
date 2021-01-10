import { AbstractTextMode } from "../abstract-text-mode";
import { getValueFromPixelString } from "../../css/css-variables";

export class NormalTextMode extends AbstractTextMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }

  cursorLeft(newCursorValue) {
    super.cursorLeft(newCursorValue);
  }

  cursorRight(newCursorValue) {
    super.cursorRight(newCursorValue);
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
