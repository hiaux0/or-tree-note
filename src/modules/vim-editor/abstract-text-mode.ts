import { VimCommandOutput } from "./../vim/vim";
import { Logger } from "modules/debug/logger";
import { isValidHorizontalPosition } from "modules/vim/modes/modes";
import { Cursor } from "modules/vim/vim";
import {
  getComputedValueFromPixelString,
  getCssVar,
} from "../css/css-variables";

const logger = new Logger({ scope: "AbstractTextMode" });

export abstract class AbstractTextMode {
  children: NodeListOf<Element>;

  caretWidth: number;
  caretHeight: number;

  currentLineNumber: number = 0;
  currentCaretCol: number = 0;

  constructor(
    public parentElement: HTMLElement,
    public childSelector: string,
    public caretElement: HTMLElement
  ) {
    this.children = parentElement.querySelectorAll(`.${childSelector}`);

    this.caretWidth = getCssVar("--caret-size-width");
    this.caretHeight = getCssVar("--caret-size-height");
  }

  cursorHorizontalMovement(newCursorValue?: Cursor) {
    //
    this.commenKeyFunctionality();

    //
    const newLeft = newCursorValue.col * this.caretWidth;
    const activeChildText = this.children[newCursorValue.line].textContent;
    if (!isValidHorizontalPosition(newCursorValue.col, activeChildText)) {
      return;
    }

    this.caretElement.style.left = `${newLeft}px`;
  }

  cursorUp() {
    this.commenKeyFunctionality();
  }
  cursorDown() {
    this.commenKeyFunctionality();
  }
  cursorRight(commandOutput: VimCommandOutput) {
    this.cursorHorizontalMovement(commandOutput?.cursor);
    return;
  }
  cursorLeft(commandOutput: VimCommandOutput) {
    this.cursorHorizontalMovement(commandOutput?.cursor);
  }

  commenKeyFunctionality() {
    this.resetCaretBlinking();
  }

  resetCaretBlinking() {
    this.caretElement.classList.remove("caret-blinking");
    /**
     * Needed to restart the animation
     * https://css-tricks.com/restart-css-animation/
     */
    void this.caretElement.offsetWidth;
    this.caretElement.classList.add("caret-blinking");
  }

  /** CARET */

  getCurrentCaretCol() {
    const curCarLeft = getComputedValueFromPixelString(
      this.caretElement,
      "left"
    );

    const currentCaretCol = Math.round(curCarLeft / this.caretWidth);

    logger.debug(["Current caret col: %n", currentCaretCol], { log: true });

    return currentCaretCol;
  }
}
