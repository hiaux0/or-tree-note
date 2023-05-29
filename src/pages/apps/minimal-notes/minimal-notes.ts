import { bindable, bindingMode } from 'aurelia-framework';
import { DomService } from 'modules/DomService';
import { SelectionService } from 'modules/SelectionService';
import { initVim } from 'modules/vim/vim-init';
import {
  Cursor,
  VimEditorOptionsV2,
  VimLine,
  VimMode,
  VimStateV2,
} from 'modules/vim/vim-types';
import rangy from 'rangy';
import { StorageService } from 'storage/vimStorage';
import './minimal-notes.scss';

export class MinimalNotes {
  @bindable({ defaultBindingMode: bindingMode.fromView }) text: string;

  inputContainerRef: HTMLDivElement;
  caretRef: HTMLDivElement;
  contenteditable = true;
  currentModeName = VimMode.NORMAL;

  lines: VimLine[] = [];
  vimState: VimStateV2;

  attached() {
    setTimeout(() => {
      this.enterNormalMode();
    }, 0);

    // this.initEventListener();
    void this.initVim();
  }

  private async initVim() {
    const savedVimState = await StorageService.getVimState();
    const startLines = savedVimState.lines ?? [];
    this.lines = startLines;

    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      container: this.inputContainerRef,
      caret: this.caretRef,
      childSelector: 'inputLine',
      startLines,
      startCursor: savedVimState.cursor,
      removeTrailingWhitespace: true,
      afterInit: (vim) => {
        this.vimState = vim.vimState;
      },
      commandListener: (vimResult, _, vim) => {
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: minimal-notes.ts ~ line 53 ~ vimResult.vimState.lines', vimResult.vimState.lines.length);
        // TODO: extract to somewhere in the core, update vimState with dom
        if (vimResult.vimState.mode !== VimMode.INSERT) {
          this.vimState = vimResult.vimState;
          vimResult.vimState.reportVimState();
          return;
        }
        const $childs = this.inputContainerRef.querySelectorAll('div');
        let targetNode = $childs[vimResult.vimState.cursor.line].childNodes[0];

        // wait until keydown got painted to the dom
        // setTimeout(() => {
        if (DomService.isTextNode(targetNode)) {
          let range: Range;
          if (vim.vimState.snippet) {
            const snippet = vim.vimState.snippet;
            const replaced = replaceSequenceWith(
              snippet.body.join(''),
              snippet.prefix.length,
              vim.vimState.lines[vimResult.vimState.cursor.line].text
            );
            targetNode = replaced.node as ChildNode;
            range = replaced.range;
          }
          vim.vimState.lines[vimResult.vimState.cursor.line].text =
            targetNode.textContent;
          range = range ?? SelectionService.getSingleRange();
          vim.vimState.cursor.col = range.startOffset;
        }
        vimResult.vimState.reportVimState();
        // }, 0);

        this.vimState = vimResult.vimState;
      },
      modeChanged: (vimResult, newMode, vim) => {
        // TODO: extract to somewhere in the core, update vimState with dom
        switch (newMode) {
          case VimMode.INSERT: {
            console.log('Enter Insert Mode');

            this.enterInsertMode(vimResult.vimState.cursor);
            break;
          }
          case VimMode.NORMAL: {
            console.log('Enter Normal Mode');
            this.enterNormalMode();
            const range = SelectionService.getSingleRange();
            // TODO: investigate the vimCore handling of cursorLeft from IN->NO
            vim.vimState.updateCursor({
              line: vimResult.vimState.cursor.line,
              col: Math.max(range.startOffset - 1, 0),
            });
            // vim.vimState.reportVimState();
            break;
          }
          default: {
            return;
          }
        }

        this.vimState = vimResult.vimState;
      },
      onCompositionUpdate: (vim, event) => {
        // wait until keydown got painted to the dom

        const $childs = (event.target as HTMLElement).querySelectorAll('div');
        const targetNode = $childs[vim.vimState.cursor.line].childNodes[0];
        vim.vimState.updateLine(
          vim.vimState.cursor.line,
          targetNode.textContent
        );
        const range = SelectionService.getSingleRange();
        vim.vimState.updateCursor({
          line: vim.vimState.cursor.line,
          col: range.startOffset,
        });
        // vim.vimState.reportVimState();
        // setTimeout(() => {
        // }, 0);
        this.vimState = vim.vimState;
      },
    };
    vimEditorOptionsV2.plugins = [
      {
        commandName: 'save',
        execute: (vimState) => {
          void StorageService.saveVimState(vimState.serialize());
        },
      },
    ];
    await initVim(vimEditorOptionsV2);
  }

  updateText() {
    this.text = this.inputContainerRef.innerText;
  }

  private enterInsertMode(
    cursor: Cursor = {
      line: 0,
      col: 0,
    }
  ) {
    const $childs = this.inputContainerRef.querySelectorAll('div');
    const targetNode = $childs[cursor.line].childNodes[0];
    const range = SelectionService.createRange(targetNode, cursor);

    setTimeout(() => {
      this.inputContainerRef.contentEditable = 'true';
      this.inputContainerRef.focus();
      rangy.getSelection().setSingleRange(range);
    });
  }
  private enterNormalMode() {
    this.inputContainerRef.contentEditable = 'false';
    // this.containerRef.focus();
  }
}

function replaceSequenceWith(
  text: string,
  snippetLength: number,
  wholeLine: string
): { node: Node; range: Range } | undefined {
  const sel = SelectionService.getSelection();
  if (sel?.rangeCount) {
    const range = sel.getRangeAt(0);

    const textNode = range.startContainer;
    textNode.textContent = wholeLine;
    const newStart = Math.max(
      text.length + range.startOffset - snippetLength,
      0
    );
    range.setStart(textNode, newStart);
    range.deleteContents();
    sel.removeAllRanges();
    sel.addRange(range);

    return { node: sel.anchorNode, range };
  }
}
