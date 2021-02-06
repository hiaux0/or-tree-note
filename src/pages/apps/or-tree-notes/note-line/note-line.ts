import { computedFrom } from 'aurelia-framework';
import { EditorLine, HighlightCoords } from 'store/initial-state';
import { bindable } from 'aurelia-framework';
import './note-line.scss';
import { VimState } from 'modules/vim/vim.types';
import { Logger } from 'modules/debug/logger';
import { getCssVar } from 'modules/css/css-variables';

const logger = new Logger({ scope: 'NoteLine' });

export class NoteLine {
  // lineHightlightWidth: string;

  @bindable value = 'NoteLine';

  @bindable line: EditorLine;

  @bindable editorLineClass: string;

  @bindable lineHighlightStart: number;
  @bindable lineHighlightEnd: number;

  @computedFrom('lineHighlightEnd', 'lineHighlightStart')
  get lineHightlightWidth() {
    // + 1: initial v already is "1"
    const diff = this.lineHighlightEnd - this.lineHighlightStart + 1;
    const caretSizeWidth = getCssVar('--caret-size-width');
    const width = `${(diff * caretSizeWidth).toFixed(2)}px`;
    return width;
  }

  isDefaultLine(line: EditorLine) {
    const isDefault = line.macro?.checkbox === undefined;
    return isDefault;
  }
}
