import { Logger } from '../../../../../common/logging/logging';
import {
  getCssVar,
  getComputedValueFromPixelString,
} from '../../../../../modules/css/css-variables';
import { VimStateClass } from '../../../../../modules/vim/vim-state';
import {
  VimMode,
  VimEditorOptionsV2,
  Cursor,
  VimStateV2,
} from '../../../../../modules/vim/vim-types';
import { VimCoreV2 } from '../vimCore/VimCoreV2';

/* eslint-disable @typescript-eslint/no-unused-vars */
const logger = new Logger('VimUi');
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export class VimUiV2 {
  public mode: VimMode;

  private readonly container: HTMLElement;
  private caret: HTMLElement;
  private readonly childSelector: string;
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

  constructor(
    public vim: VimCoreV2,
    public vimEditorOptionsV2: VimEditorOptionsV2
  ) {
    this.container = vimEditorOptionsV2.container;
    this.caret = vimEditorOptionsV2.caret;
    this.childSelector = vimEditorOptionsV2.childSelector;

    this.caretWidth = getCssVar('--caret-size-width');
    this.caretHeight = getCssVar('--caret-size-height');

    if (!this.caret) {
      this.createCaret();
    }
    if (!this.container) return;
    this.update(vim.getVimState());
  }

  private createCaret() {
    const $caret = document.createElement('div');
    $caret.id = 'caret';
    this.container.appendChild($caret);
    this.caret = $caret;
  }

  public update(vimState: VimStateV2): void {
    this.setCursorMovement(vimState.cursor);
  }

  private setCursorMovement(newCursorValue?: Cursor) {
    if (!this.caret) return;

    //
    let newCursorLine: number;
    let newCursorCol: number;

    if (newCursorValue) {
      newCursorLine = newCursorValue.line;
      newCursorCol = newCursorValue.col;
    } else {
      // just use old values
      newCursorLine = this.currentLineNumber;
      newCursorCol = this.currentCaretCol;
    }

    this.commenKeyFunctionality();
    const lineOffsetLeft = this.getLineRectOffsetLeft();

    const horiDirection =
      this.currentLineNumber > newCursorLine ? 'up' : 'down';
    const horiSame = this.currentLineNumber === newCursorLine;
    const horiDelta = Math.abs(this.currentLineNumber - newCursorLine);

    const vertiDirection =
      this.currentCaretCol > newCursorCol ? 'left' : 'right';
    const vertiSame = this.currentCaretCol === newCursorCol;
    const vertiDelta = Math.abs(this.currentCaretCol - newCursorCol);

    let direction: Direction = 'none';
    let delta = 0;
    if (!vertiSame) {
      direction = vertiDirection;
      delta = vertiDelta;
    } else if (!horiSame) {
      direction = horiDirection;
      delta = horiDelta;
    }

    this.currentLineNumber = newCursorLine;
    this.currentCaretCol = newCursorCol;

    const newTop = newCursorLine * this.caretHeight;
    this.caret.style.top = `${newTop}px`;
    const newLeft = newCursorCol * this.caretWidth;
    this.caret.style.left = `${lineOffsetLeft + newLeft}px`;
    this.scrollEditor(direction, delta);
  }

  private readonly scrollEditor = (
    direction: Direction,
    delta: number
  ): void => {
    const cursor = this.caret;
    const editor = this.container;
    const containerRect = editor.getBoundingClientRect();

    /** Relative to container */
    const cursorRect = cursor.getBoundingClientRect();
    const lineHeight = this.caretHeight;
    const cursorWidth = cursorRect.width;
    const relCursorTop = cursorRect.top; // - containerRect.top;
    const relCursorLeft = cursorRect.left; // - containerRect.top;
    const relCursorBottom = cursorRect.bottom; //  - containerRect.top;
    const relCursorRight = cursorRect.right; //  - containerRect.top;

    const THRESHOLD_VALUE = 40; // - 40: 40 away from <direction>, then should scroll
    // bottom = right, up = left

    const bottomThreshold = containerRect.bottom - THRESHOLD_VALUE;
    const shouldScrollDown = relCursorBottom > bottomThreshold;
    const topThreshold = containerRect.top + THRESHOLD_VALUE;
    const shouldScrollUp = relCursorTop < topThreshold;

    const rightThreshold = containerRect.right - THRESHOLD_VALUE;
    const shouldScrollRight = relCursorRight > rightThreshold;
    const leftThreshold = containerRect.left + THRESHOLD_VALUE;
    const shouldScrollLeft = relCursorLeft < leftThreshold;

    const horiChange = delta * lineHeight;
    const vertiChange = delta * cursorWidth;
    switch (direction) {
      case 'up':
        if (shouldScrollUp) {
          editor.scrollTop -= horiChange;
        }
        break;
      case 'down':
        if (shouldScrollDown) {
          editor.scrollTop += horiChange;
        }
        break;
      case 'left':
        if (shouldScrollLeft) {
          editor.scrollLeft -= vertiChange;
        }
        break;
      case 'right':
        if (shouldScrollRight) {
          editor.scrollLeft += vertiChange;
        }
        break;
      default: {
        break;
      }
    }

    // cursor.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'nearest',
    //   inline: 'nearest',
    // });
  };

  getLineRectOffsetLeft() {
    const children = this.container.querySelectorAll<HTMLElement>(
      this.childSelector
    );
    const currentChild = children[this.currentLineNumber];
    let childOffsetLeft = 0;
    if (currentChild != null) {
      childOffsetLeft = currentChild.offsetLeft;
    }

    // logger.debug(['Child offset: %d', childOffsetLeft]);

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
  /* prettier-ignore */ jumpNextBlock(vimState: VimStateClass)            { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ jumpPreviousBlock(vimState: VimStateClass)        { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAtBack(vimState: VimStateClass)        { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAt(vimState: VimStateClass)            { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterAfterBack(vimState: VimStateClass)     { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toCharacterBefore(vimState: VimStateClass)        { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ toggleFold(vimState: VimStateClass)               { this.setCursorMovement(vimState?.cursor); }
  /* prettier-ignore */ enterNormalMode(vimState: VimStateClass)          { this.setCursorMovement(vimState?.cursor); }

  /** "o" and not "enter" */
  async createNewLine(vimState: VimStateClass) {
    // const newLineIndex = vimState.cursor.line;
    // createNewLine,
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
    // createNewLine,
    this.setCursorMovement(vimState.cursor);
  }
  async indentRight(vimState: VimStateClass) {
    // changeText,
    this.setCursorMovement(vimState.cursor);
  }
  async indentLeft(vimState: VimStateClass) {
    // changeText,
    this.setCursorMovement(vimState.cursor);
  }
  async delete(vimState: VimStateClass) {
    // changeText,
  }
  async replace(vimState: VimStateClass) {
    // changeText,
  }

  async paste(vimState: VimStateClass) {
    // changeManyText;
  }

  resetCaretBlinking() {
    if (!this.caret) return;

    this.caret.classList.remove('caret-blinking');
    /**
     * Needed to restart the animation
     * https://css-tricks.com/restart-css-animation/
     */
    void this.caret.offsetWidth;
    this.caret.classList.add('caret-blinking');
  }

  /** CARET */

  getCurrentCaretCol() {
    const curCarLeft = getComputedValueFromPixelString(this.caret, 'left');

    const currentCaretCol = Math.round(curCarLeft / this.caretWidth);

    /* prettier-ignore */ logger.culogger.debug(['Current caret col: %n', currentCaretCol], { log: true });

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
