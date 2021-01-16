import { VimState } from "./../vim/vim";
import { Logger } from "modules/debug/logger";
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

  setCursorMovement(newCursorValue?: Cursor) {
    //
    this.commenKeyFunctionality();

    //
    const newTop = newCursorValue.line * this.caretHeight;
    this.caretElement.style.top = `${newTop}px`;
    this.currentLineNumber = newCursorValue.line;

    const newLeft = newCursorValue.col * this.caretWidth;
    this.caretElement.style.left = `${newLeft}px`;
    this.currentCaretCol = newCursorValue.col;
  }

  cursorUp(vimState?: VimState) {
    this.setCursorMovement(vimState?.cursor);
  }
  cursorDown(vimState?: VimState) {
    this.setCursorMovement(vimState?.cursor);
  }
  cursorRight(vimState: VimState) {
    this.setCursorMovement(vimState?.cursor);
    return;
  }
  cursorLeft(vimState: VimState) {
    this.setCursorMovement(vimState?.cursor);
  }
  cursorWordForwardEnd(vimState: VimState) {
    this.setCursorMovement(vimState?.cursor);
  }
  cursorBackwordsStartWord(vimState: VimState) {
    this.setCursorMovement(vimState?.cursor);
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
