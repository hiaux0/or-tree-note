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

  isDefaultLine(line: EditorLine) {
    const isDefault = line.macro?.checkbox === undefined;
    return isDefault;
  }
}
