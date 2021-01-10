import { AbstractTextMode } from "../abstract-text-mode";
import { replaceAt } from "modules/string/string";
import { VimCommandOutput } from "modules/vim/vim";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

export class InsertTextMode extends AbstractTextMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }

  backspace(commandOutput?: VimCommandOutput) {
    const currentLine = this.children[this.currentLineNumber];
    const curLineText = currentLine.textContent;
    const currentCaretCol = this.getCurrentCaretCol();

    const result = replaceAt(curLineText, currentCaretCol - 1, "");
    currentLine.textContent = result;

    super.cursorLeft(commandOutput);
  }

  delete() {
    const currentLine = this.children[this.currentLineNumber];
    const curLineText = currentLine.textContent;
    const currentCaretCol = this.getCurrentCaretCol();

    const result = replaceAt(curLineText, currentCaretCol, "");
    currentLine.textContent = result;
  }

  type(commandOutput?: VimCommandOutput) {
    const currentLine = this.children[this.currentLineNumber];

    currentLine.textContent = commandOutput.text;
    super.cursorRight(commandOutput);
  }
}
