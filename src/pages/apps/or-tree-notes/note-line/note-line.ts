import { computedFrom } from 'aurelia-framework';
import { EditorLine } from 'store/initial-state';
import { bindable } from 'aurelia-framework';
import './note-line.scss';
import { Logger } from 'modules/debug/logger';
import { getCssVar } from 'modules/css/css-variables';
import { Cursor } from 'modules/vim/vim.types';

const logger = new Logger({ scope: 'NoteLine' });

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

    const minCol = Math.min(endCol, startCol);
    // + 1: initial v already is "1"
    const diffCol = Math.max(endCol, startCol) - minCol + 1;
    const caretSizeWidth = getCssVar('--caret-size-width');

    const width = `${Math.abs(diffCol * caretSizeWidth).toFixed(2)}px`;
    const left = `${(minCol * caretSizeWidth).toFixed(2)}px`;

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
