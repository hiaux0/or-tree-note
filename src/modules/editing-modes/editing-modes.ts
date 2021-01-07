import {
  CURSOR_UP,
  CURSOR_DOWN,
  INSERT_MODE,
} from "./../../resources/keybindings/app.keys";
import {
  COMMAND_PALETT,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  ESCAPE,
} from "../../resources/keybindings/app.keys";
import { getCssVar, getValueFromPixelString } from "../css/css-variables";
import hotkeys from "hotkeys-js";

const CARET_NORMAL_CLASS = "caret-normal";
const CARET_INSERT_CLASS = "caret-insert";

function isHTMLElement(input): input is HTMLElement {
  if (typeof input === "string") return false;
  return true;
}

export class EditingModes {
  children: NodeListOf<Element>;

  caretWidth: number;
  caretHeight: number;

  constructor(
    private parentElement: HTMLElement,
    private childSelector: string,
    private caretElement: HTMLElement
  ) {
    this.children = parentElement.querySelectorAll(this.childSelector);
  }

  setVariables() {
    this.caretWidth = getCssVar("--caret-size-width");
    this.caretHeight = getCssVar("--caret-size-height");
  }

  init() {
    this.setVariables();
    this.initKeyBinding();
    this.initCursors();
    this.initModes();
  }

  initKeyBinding() {
    // Init hotkeys
    hotkeys.noConflict();

    hotkeys.filter = function () {
      return true;
    }; // 2018-08-09 23:30:46 what does this do?
    let previousScope = hotkeys.getScope();

    hotkeys(COMMAND_PALETT, () => {
      hotkeys.setScope(previousScope);
    });
  }

  initModes() {
    this.enterInsertMode();
    this.enterNormalMode();
  }

  enterInsertMode() {
    hotkeys(INSERT_MODE, () => {
      this.caretElement.classList.remove(CARET_NORMAL_CLASS);
      this.caretElement.classList.add(CARET_INSERT_CLASS);
    });
  }

  enterNormalMode() {
    hotkeys(ESCAPE, () => {
      this.caretElement.classList.remove(CARET_INSERT_CLASS);
      this.caretElement.classList.add(CARET_NORMAL_CLASS);
    });
  }

  initCursors() {
    this.cursorLeft();
    this.cursorRight();
    this.cursorUp();
    this.cursorDown();
  }

  cursorLeft() {
    hotkeys(CURSOR_LEFT, () => {
      this.resetCaretBlinking();
      const currentCaretLeft = getValueFromPixelString(
        this.caretElement.style.left
      );

      const newLeft = currentCaretLeft - this.caretWidth;

      if (newLeft < 0) {
        return;
      }
      this.caretElement.style.left = `${newLeft}px`;
    });
  }

  cursorRight() {
    hotkeys(CURSOR_RIGHT, () => {
      this.resetCaretBlinking();
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
    });
  }

  cursorUp() {
    hotkeys(CURSOR_UP, () => {
      this.resetCaretBlinking();
      const currentCaretTop = getValueFromPixelString(
        this.caretElement.style.top
      );

      const newTop = currentCaretTop - this.caretHeight;
      if (newTop < 0) {
        return;
      }

      this.caretElement.style.top = `${newTop}px`;
    });
  }

  cursorDown() {
    hotkeys(CURSOR_DOWN, () => {
      this.resetCaretBlinking();
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
    });
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
}
