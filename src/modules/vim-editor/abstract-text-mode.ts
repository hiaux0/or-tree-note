import { rootContainer } from "modules/root-container";
import { VimState } from "../vim/vim.types";
import { Logger } from "modules/debug/logger";
import { Cursor } from "modules/vim/vim.types";
import {
  getComputedValueFromPixelString,
  getCssVar,
} from "../css/css-variables";
import { ChildrenMutationObserver } from "./children-mutation-observer";

const logger = new Logger({ scope: "AbstractTextMode" });

export abstract class AbstractTextMode {
  children: NodeListOf<HTMLElement>;

  caretWidth: number;
  caretHeight: number;

  currentLineNumber: number = 0;
  currentCaretCol: number = 0;

  childrenMutationObserver: ChildrenMutationObserver;

  constructor(
    public parentElement: HTMLElement,
    public childSelector: string,
    public caretElement: HTMLElement
  ) {
    this.children = parentElement.querySelectorAll<HTMLElement>(
      `.${childSelector}`
    );

    this.childrenMutationObserver = rootContainer.get(ChildrenMutationObserver);
    this.childrenMutationObserver.createObserver(parentElement, () => {
      this.children = parentElement.querySelectorAll<HTMLElement>(
        `.${this.childSelector}`
      );
    });

    this.caretWidth = getCssVar("--caret-size-width");
    this.caretHeight = getCssVar("--caret-size-height");
  }

  setCursorMovement(newCursorValue?: Cursor) {
    //
    this.currentLineNumber = newCursorValue.line;
    this.currentCaretCol = newCursorValue.col;

    this.commenKeyFunctionality();
    const lineOffsetLeft = this.getLineRectOffsetLeft();

    //
    const newTop = newCursorValue.line * this.caretHeight;
    this.caretElement.style.top = `${newTop}px`;

    const newLeft = newCursorValue.col * this.caretWidth;
    this.caretElement.style.left = `${lineOffsetLeft + newLeft}px`;
  }

  getLineRectOffsetLeft() {
    const currentChild = this.children[this.currentLineNumber];
    const childOffsetLeft = currentChild.offsetLeft;

    logger.debug(["Child offset: %d", childOffsetLeft]);

    if (childOffsetLeft > 0) {
      return childOffsetLeft;
    }
    return 0;
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
