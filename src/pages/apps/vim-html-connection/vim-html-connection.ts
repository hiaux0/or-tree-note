import { autoinject, bindable } from 'aurelia-framework';
import { initVimHtml } from 'modules/vim-html';
import './vim-html-connection.scss';

@autoinject
export class VimHtmlConnection {
  @bindable value = 'VimHtmlConnection';

  targetCommand: string;
  line: number;
  col: number;

  attached() {
    initVimHtml({
      commandListener: (result) => {
        this.targetCommand = result.targetCommand;
        this.line = result.vimState.cursor.line;
        this.col = result.vimState.cursor.col;
      },
    });
  }
}
