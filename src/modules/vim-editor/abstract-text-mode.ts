import { logger } from "modules/debug/logger";
import {
  getComputedValueFromPixelString,
  getCssVar,
  getValueFromPixelString,
} from "../css/css-variables";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

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

  keyPressed(_pressedKey: string, _targetCommandName?: string) {}

  cursorUp() {
    this.commenKeyFunctionality();
  }
  cursorDown() {
    this.commenKeyFunctionality();
  }
  cursorRight() {
    this.commenKeyFunctionality();

    const currentCaretLeft = getValueFromPixelString(
      this.caretElement.style.left
    );

    const newLeft = currentCaretLeft + this.caretWidth;
    const parentWidth = getValueFromPixelString(
      getComputedStyle(this.parentElement).width
    );

    /**
     * TODO: Only until word end
     */
    if (newLeft > parentWidth) {
      return;
    }

    this.caretElement.style.left = `${newLeft}px`;
  }

  cursorLeft() {
    this.commenKeyFunctionality();
    const currentCaretLeft = getValueFromPixelString(
      this.caretElement.style.left
    );

    const newLeft = currentCaretLeft - this.caretWidth;

    if (newLeft < 0) {
      return;
    }
    this.caretElement.style.left = `${newLeft}px`;
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
