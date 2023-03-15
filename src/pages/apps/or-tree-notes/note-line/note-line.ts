import { inject } from 'aurelia-dependency-injection';
import { computedFrom, bindable } from 'aurelia-framework';
import { CSS_SELECTORS } from 'common/css-selectors';
import { getCssVar } from 'modules/css/css-variables';
import { CursorUtils } from 'modules/cursor/cursor-utils';
import { Logger } from 'modules/debug/logger';
import { Cursor, FoldMap } from 'modules/vim/vim-types';
import { EditorLine } from 'store/initial-state';

import './note-line.scss';

const logger = new Logger({ scope: 'NoteLine' });

@inject(Element)
export class NoteLine {
  private cachedStartCol: number;
  private cachedEndCol: number;
  private cachedLeft: string;
  private cachedWidth: string;

  @bindable value = 'NoteLine';

  @bindable line: EditorLine;
  @bindable lineIndex: number;
  @bindable cursorIndex: number;

  @bindable editorLineClass: string;

  @bindable caretElement: HTMLElement;

  @bindable lineHighlightStart: Cursor;
  @bindable lineHighlightEnd: Cursor;
  @bindable foldMap: FoldMap;

  constructor(private readonly element: HTMLElement) {}

  @computedFrom('lineHighlightEnd', 'lineHighlightStart')
  get lineHightlight() {
    if (!this.lineHighlightStart) return {};
    if (!this.lineHighlightEnd) return {};

    const editorLine = this.element.querySelector<HTMLElement>(
      `.${CSS_SELECTORS['editor-line']}`
    );
    if (editorLine === null) return {};

    let width = '';
    let left = '';
    const endCol = this.lineHighlightEnd?.col;
    const startCol = this.lineHighlightStart?.col;
    const minCol = Math.min(endCol, startCol);
    const diffCol = Math.max(endCol, startCol) - minCol + 1;
    const caretSizeWidth = getCssVar('--caret-size-width');

    const oneLine =
      this.lineHighlightStart.line === this.lineHighlightEnd.line &&
      this.lineHighlightStart.line === this.lineIndex;
    if (oneLine) {
      width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
      left = `${(minCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
        2
      )}px`;
    } else {
      const sameStartLine = this.lineIndex === this.lineHighlightStart?.line;
      const sameEndLine = this.lineIndex === this.lineHighlightEnd?.line;
      const goingDown =
        this.lineHighlightEnd.line > this.lineHighlightStart.line;
      const goingUp = this.lineHighlightEnd.line < this.lineHighlightStart.line;
      const endColOfLine = this.line.text.length;
      const diff = endColOfLine - startCol;
      const isWithinLines = CursorUtils.isWithinLines(
        this.lineHighlightStart,
        this.lineHighlightEnd,
        {
          col: this.cursorIndex,
          line: this.lineIndex,
        }
      );

      if (sameStartLine) {
        if (goingDown) {
          width = `${Math.abs(diff * caretSizeWidth).toFixed(2)}px`;
          left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
            2
          )}px`;
        } else if (goingUp) {
          width = `${Math.abs(
            this.lineHighlightEnd.col * caretSizeWidth
          ).toFixed(2)}px`;
          left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
        }
      } else if (sameEndLine) {
        if (goingDown) {
          width = `${Math.abs(
            this.lineHighlightEnd.col * caretSizeWidth
          ).toFixed(2)}px`;
          left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
        } else if (goingUp) {
          width = `${Math.abs(diff * caretSizeWidth).toFixed(2)}px`;
          left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
            2
          )}px`;
        }
      } else if (isWithinLines) {
        width = `${Math.abs(endColOfLine * caretSizeWidth).toFixed(2)}px`;
        left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
      }
    }

    this.cachedEndCol = endCol;
    this.cachedStartCol = startCol;
    this.cachedWidth = width;
    this.cachedLeft = left;

    return { width, left };
  }

  get aht() {
    const notAtEndLine = this.lineIndex !== this.lineHighlightEnd?.line;
    const notAtStartLine = this.lineIndex !== this.lineHighlightStart?.line;
    if (notAtEndLine || notAtStartLine) {
      // console.log(`${this.lineIndex} -- NOT`);
      // return {};
    }
    // console.log(`${this.lineIndex} -- YES`);

    const endCol = this.lineHighlightEnd?.col;
    const startCol = this.lineHighlightStart?.col;

    if (endCol === this.cachedEndCol && startCol === this.cachedStartCol) {
      // return {
      //   left: this.cachedLeft,
      //   width: this.cachedWidth,
      // };
    }

    const editorLine = this.element.querySelector<HTMLElement>(
      `.${CSS_SELECTORS['editor-line']}`
    );
    if (editorLine === null) return {};

    const minCol = Math.min(endCol, startCol);
    // + 1: initial v already is "1"
    const diffCol = Math.max(endCol, startCol) - minCol + 1;
    const caretSizeWidth = getCssVar('--caret-size-width');

    let width = '';
    let left = '';

    const sameEndLine = this.lineIndex === this.lineHighlightEnd?.line;
    const sameStartLine = this.lineIndex === this.lineHighlightStart?.line;
    const sameLine = sameEndLine && sameStartLine;
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 76 ~ this.lineHighlightStart', this.lineHighlightStart);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 78 ~ this.lineHighlightEnd', this.lineHighlightEnd);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 77 ~ this.cursorIndex', this.cursorIndex);
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 79 ~ this.lineIndex', this.lineIndex);
    const isWithinLines = CursorUtils.isWithinLines(
      this.lineHighlightStart,
      this.lineHighlightEnd,
      {
        col: this.cursorIndex,
        line: this.lineIndex,
      }
    );

    /* prettier-ignore */ console.log('------------------------------------------------------------------------------------------');
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 89 ~ this.lineHighlightStart', this.lineHighlightStart);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: note-line.ts ~ line 89 ~ this.lineHighlightEnd', this.lineHighlightEnd);

    const isMultiVisualLine =
      this.lineHighlightEnd.line - this.lineHighlightStart.line > 0;
    if (isMultiVisualLine) {
      const isGoingDown = this.lineIndex < this.lineHighlightStart.line;
      const isGoingUp = this.lineHighlightStart.line < this.lineIndex;
      if (isGoingDown) {
        width = `${Math.abs(5 * caretSizeWidth).toFixed(2)}px`;
        left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
          2
        )}px`;
      } else if (isGoingUp) {
      }
    }

    if (isWithinLines) {
      if (sameLine) {
        // console.log('>>> 1 >>> Same Line');
        width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
        left = `${(minCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
          2
        )}px`;
      } else if (sameStartLine) {
        width = `${Math.abs(5 * caretSizeWidth).toFixed(2)}px`;
        left = `${(startCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
          2
        )}px`;
      } else if (sameEndLine) {
        width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
        left = `${(minCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
          2
        )}px`;
      } else {
        width = `${Math.abs(5 * caretSizeWidth).toFixed(2)}px`;
        left = `${(0 * caretSizeWidth + editorLine.offsetLeft).toFixed(2)}px`;
      }
    } else {
      // console.log('>>> 3 >>> Another');
      // width = `${Math.abs(1 * caretSizeWidth).toFixed(2)}px`;
      // left = `${editorLine.offsetLeft.toFixed(2)}px`;
    }

    this.cachedEndCol = endCol;
    this.cachedStartCol = startCol;
    this.cachedWidth = width;
    this.cachedLeft = left;

    return { width, left };
  }

  isDefaultLine(line: EditorLine) {
    const isDefault = line.macro?.checkbox === undefined;
    return isDefault;
  }
}
