import { AbstractTextMode } from "../abstract-text-mode";
import { replaceAt } from "modules/string/string";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

export class InsertTextMode extends AbstractTextMode {
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

  type(newContent: string) {
    const currentLine = this.children[this.currentLineNumber];

    currentLine.textContent = newContent;
    super.cursorRight();
  }
}
