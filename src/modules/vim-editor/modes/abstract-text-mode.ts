/* eslint-disable @typescript-eslint/brace-style */
import { inject } from 'aurelia-dependency-injection';
import { jump, StateHistory, Store } from 'aurelia-store';
import {
  getComputedValueFromPixelString,
  getCssVar,
} from 'modules/css/css-variables';
import { Logger } from 'modules/debug/logger';
import { rootContainer } from 'modules/root-container';
import { VimStateClass } from 'modules/vim/vim-state';
import { Cursor, VimMode } from 'modules/vim/vim-types';
import { VimEditorState } from 'store/initial-state';

import {
  createNewLine,
  changeText,
  changeVimState,
} from '../actions/actions-vim-editor';
import { ChildrenMutationObserver } from './children-mutation-observer';

const logger = new Logger({ scope: 'AbstractTextMode' });
type Direction = 'up' | 'down' | 'left' | 'right';

@inject(Store)
export abstract class AbstractTextMode {
  public mode: VimMode;

  private readonly caretWidth: number;
  private readonly caretHeight: number;
  private _currentLineNumber: number = 0;
  private get currentLineNumber(): number {
    return this._currentLineNumber;
  }
  private set currentLineNumber(value: number) {
    this._currentLineNumber = value;
  }
  private currentCaretCol: number = 0;
  private children: NodeListOf<HTMLElement>;
  private readonly childrenMutationObserver: ChildrenMutationObserver;

  constructor(
    public parentElement: HTMLElement,
    public childSelector: string,
    public caretElement: HTMLElement,
    public store?: Store<StateHistory<VimEditorState>>
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

    this.caretWidth = getCssVar('--caret-size-width');
    this.caretHeight = getCssVar('--caret-size-height');

    this.store.registerAction('createNewLine', createNewLine);
  }

  setCursorMovement(newCursorValue?: Cursor) {
    //
    let newCursorLine;
    let newCursorCol;

    if (newCursorValue) {
      newCursorLine = newCursorValue.line;
      newCursorCol = newCursorValue.col;
    } else {
      // just use old values
      newCursorLine = this.currentLineNumber;
      newCursorCol = this.currentCaretCol;
    }

    console.clear();

    this.commenKeyFunctionality();
    const lineOffsetLeft = this.getLineRectOffsetLeft();

    const horiDirection =
      this.currentLineNumber > newCursorLine ? 'up' : 'down';
    const horiSame = this.currentLineNumber === newCursorLine;
    this.currentLineNumber = newCursorLine;
    const vertiDirection =
      this.currentCaretCol > newCursorCol ? 'left' : 'right';
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: abstract-text-mode.ts ~ line 88 ~ vertiDirection', vertiDirection);
    const vertiSame = this.currentCaretCol === newCursorCol;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: abstract-text-mode.ts ~ line 91 ~ vertiSame', vertiSame);
    this.currentCaretCol = newCursorCol;

    let direction = '';
    if (!vertiSame) {
      direction = vertiDirection;
    } else if (!horiSame) {
      direction = horiDirection;
    }

    // /* prettier-ignore */ console.log('------------------------------------------------------------------------------------------');
    const cursor = this.caretElement;
    const editor = this.parentElement;
    moveCursor.bind(this)(editor, cursor, direction);
    const newTop = newCursorLine * this.caretHeight;
    this.caretElement.style.top = `${newTop}px`;
    const newLeft = newCursorCol * this.caretWidth;
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: abstract-text-mode.ts ~ line 154 ~ newLeft', newLeft);
    this.caretElement.style.left = `${lineOffsetLeft + newLeft}px`;

    return;

    function moveCursor(
      editor: HTMLElement,
      cursor: HTMLElement,
      direction: Direction
    ) {
      /* prettier-ignore */ console.log('------------------------------------------------------------------------------------------');
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: abstract-text-mode.ts ~ line 111 ~ direction', direction);
      const lineHeight = this.caretHeight as number;
      const containerRect = editor.getBoundingClientRect();

      /** Relative to container */
      const cursorRect = cursor.getBoundingClientRect();
      const relCursorTop = cursorRect.top; // - containerRect.top;
      const relCursorLeft = cursorRect.left; // - containerRect.top;
      const relCursorBottom = cursorRect.bottom; //  - containerRect.top;
      const relCursorRight = cursorRect.right; //  - containerRect.top;

      const THRESHOLD_VALUE = 40; // - 40: 40 away from <direction>, then should scroll
      // bottom = right, up = left

      const bottomThreshold = containerRect.bottom - THRESHOLD_VALUE;
      const shouldScrollDown = relCursorBottom > bottomThreshold;
      const rightThreshold = containerRect.right - THRESHOLD_VALUE;
      const shouldScrollRight = relCursorRight > rightThreshold;

      const topThreshold = containerRect.top + THRESHOLD_VALUE;
      const shouldScrollUp = relCursorTop < topThreshold;
      const leftThreshold = containerRect.left + THRESHOLD_VALUE;
      const shouldScrollLeft = relCursorLeft < leftThreshold;

      switch (direction) {
        case 'up':
          if (shouldScrollUp) {
            editor.scrollTop -= lineHeight;
          }
          break;
        case 'down':
          if (shouldScrollDown) {
            editor.scrollTop += lineHeight;
          }
          break;
        case 'left':
          if (shouldScrollLeft) {
            editor.scrollLeft -= cursorRect.width;
          }
          break;
        case 'right':
          if (shouldScrollRight) {
            editor.scrollLeft += cursorRect.width;
          }
          break;
        default: {
          console.log('NEITHER');
          break;
        }
      }

      // cursor.scrollIntoView({
      //   behavior: 'smooth',
      //   block: 'nearest',
      //   inline: 'nearest',
      // });
    }
  }

  getLineRectOffsetLeft() {
    const children = this.parentElement.querySelectorAll<HTMLElement>(
      `.${this.childSelector}`
    );
    const currentChild = children[this.currentLineNumber];
    let childOffsetLeft = 0;
    if (currentChild != null) {
      childOffsetLeft = currentChild.offsetLeft;
    }

    logger.debug(['Child offset: %d', childOffsetLeft]);

    return childOffsetLeft;
  }

  /** ****** */
  /* Cursor */
  /** ****** */
  /* prettier-ignore */ cursorUp(vimState?: VimStateClass)                { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorDown(vimState?: VimStateClass)              { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorRight(vimState: VimStateClass)              { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorLeft(vimState: VimStateClass)               { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorWordForwardEnd(vimState: VimStateClass)     { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorWordForwardStart(vimState: VimStateClass)   { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorBackwordsStartWord(vimState: VimStateClass) { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorLineEnd(vimState: VimStateClass)            { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ cursorLineStart(vimState: VimStateClass)          { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAtBack(vimState: VimStateClass)        { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAt(vimState: VimStateClass)            { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAfterBack(vimState: VimStateClass)     { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterBefore(vimState: VimStateClass)        { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toggleFold(vimState: VimStateClass)               { this.setCursorMovement(vimState?.cursor); }

  /** "o" and not "enter" */
  async createNewLine(vimState: VimStateClass) {
    const newLineIndex = vimState.cursor.line;
    await this.store.dispatch(
      createNewLine,
      newLineIndex,
      vimState.getPreviousLine().text,
      vimState.getActiveLine().text
    );
    this.setCursorMovement(vimState?.cursor);
  }

  deleteLine(vimState: VimStateClass) {
    this.setCursorMovement(vimState?.cursor);
  }

  commenKeyFunctionality() {
    this.resetCaretBlinking();
  }

  /** **** */
  /* Text */
  /** **** */
  async newLine(vimState: VimStateClass) {
    /* prettier-ignore */ console.log('------------------------------------------------------------------------------------------');
    const newLineIndex = vimState.cursor.line;
    await this.store.dispatch(
      createNewLine,
      newLineIndex,
      vimState.getPreviousLine().text,
      vimState.getActiveLine().text
    );
    this.setCursorMovement(vimState.cursor);
  }
  async indentRight(vimState: VimStateClass) {
    await this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
    this.setCursorMovement(vimState.cursor);
  }
  async indentLeft(vimState: VimStateClass) {
    await this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
    this.setCursorMovement(vimState.cursor);
  }
  async delete(vimState: VimStateClass) {
    await this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
  }
  async replace(vimState: VimStateClass) {
    await this.store.dispatch(
      changeText,
      vimState.cursor.line,
      vimState.getActiveLine().text
    );
  }

  // async toggleFold(vimState: VimStateClass) {
  //   await this.store.dispatch(changeVimState, vimState);
  // }
  async undo() {
    await this.store.dispatch(jump, -1);
  }
  async redo() {
    await this.store.dispatch(jump, +1);
  }

  resetCaretBlinking() {
    this.caretElement.classList.remove('caret-blinking');
    /**
     * Needed to restart the animation
     * https://css-tricks.com/restart-css-animation/
     */
    void this.caretElement.offsetWidth;
    this.caretElement.classList.add('caret-blinking');
  }

  /** CARET */

  getCurrentCaretCol() {
    const curCarLeft = getComputedValueFromPixelString(
      this.caretElement,
      'left'
    );

    const currentCaretCol = Math.round(curCarLeft / this.caretWidth);

    logger.debug(['Current caret col: %n', currentCaretCol], { log: true });

    return currentCaretCol;
  }

  private copy(vimState?: VimStateClass): void {
    const { visualStartCursor, visualEndCursor } = vimState;
    if (!visualStartCursor) return;
    if (!visualEndCursor) return;

    // only text
    let textToCopy = '';
    const numOflinesToCopy = visualEndCursor.line - visualStartCursor.line;
    if (numOflinesToCopy === 0) {
      const { text } = vimState.getActiveLine();
      textToCopy += text.slice(visualStartCursor.col, visualEndCursor.col - 1);
    } else {
      for (let i = visualStartCursor.line; i <= numOflinesToCopy; i++) {
        const isStartLine = i === visualStartCursor.line;
        const isEndLine = i === visualEndCursor.line;
        const { text } = vimState.getLineAt(i);

        if (isStartLine) {
          textToCopy += text.slice(visualStartCursor.col, text.length - 1);
        } else if (isEndLine) {
          const { text } = vimState.getLineAt(i);
          textToCopy += text.slice(0, visualEndCursor.col - 1);
        } else {
          textToCopy += text.slice(0, text.length - 1);
        }
      }
    }

    // TODO also data (ie. is a bullet list)

    const handler = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', textToCopy);
      e.preventDefault();
    };

    document.addEventListener('copy', handler);
    document.execCommand('copy');
    document.removeEventListener('copy', handler);
  }
}

function isInside(parent: HTMLElement, child: HTMLElement): boolean {
  return parent.contains(child);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;

  const first = rect.top >= 0 + 0;
  const second = rect.left >= 0 + 0;
  // const third = rect.bottom <= viewportHeight - 30;
  const third = rect.bottom <= viewportHeight - 0;
  const fourth = rect.right <= viewportWidth + 0;

  return first && second && third && fourth;
}
