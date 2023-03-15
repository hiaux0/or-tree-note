import { inject } from 'aurelia-dependency-injection';
import { computedFrom, bindable } from 'aurelia-framework';
import { CSS_SELECTORS } from 'common/css-selectors';
import { getCssVar } from 'modules/css/css-variables';
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

  @bindable editorLineClass: string;

  @bindable caretElement: HTMLElement;

  @bindable lineHighlightStart: Cursor;
  @bindable lineHighlightEnd: Cursor;
  @bindable foldMap: FoldMap;

  constructor(private readonly element: HTMLElement) {}

  @computedFrom('lineHighlightEnd', 'lineHighlightStart')
  get lineHightlight() {
    if (
      this.lineIndex !== this.lineHighlightEnd?.line ||
      this.lineIndex !== this.lineHighlightStart?.line
    ) {
      return {};
    }

    const endCol = this.lineHighlightEnd.col;
    const startCol = this.lineHighlightStart.col;

    if (endCol === this.cachedEndCol && startCol === this.cachedStartCol) {
      return {
        left: this.cachedLeft,
        width: this.cachedWidth,
      };
    }

    const editorLine = this.element.querySelector<HTMLElement>(
      `.${CSS_SELECTORS['editor-line']}`
    );

    const minCol = Math.min(endCol, startCol);
    // + 1: initial v already is "1"
    const diffCol = Math.max(endCol, startCol) - minCol + 1;
    const caretSizeWidth = getCssVar('--caret-size-width');

    const width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
    const left = `${(minCol * caretSizeWidth + editorLine.offsetLeft).toFixed(
      2
    )}px`;

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
