import { bindable, bindingMode } from 'aurelia-framework';
// import { Logger } from 'common/logging/logging';
import { DomService } from 'modules/DomService';
import { SelectionService } from 'modules/SelectionService';
import { initVim } from 'modules/vim/vim-init';
import { VimStateClass } from 'modules/vim/vim-state';
import {
  Cursor,
  VimEditorOptionsV2,
  VimLine,
  VimMode,
} from 'modules/vim/vim-types';
import rangy from 'rangy';
import { StorageService } from 'storage/vimStorage';
import './minimal-notes.scss';

// const logger = new Logger('MinimalNotes');

export class MinimalNotes {
  @bindable({ defaultBindingMode: bindingMode.fromView }) text: string;

  inputContainerRef: HTMLDivElement;
  caretRef: HTMLDivElement;
  contenteditable = true;
  currentModeName = VimMode.NORMAL;

  lines: VimLine[] = [];
  vimState: VimStateClass;

  attached() {
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
        // TODO: extract to somewhere in the core, update vimState with dom
        if (vimResult.vimState.mode !== VimMode.INSERT) {
          // vimResult.vimState.reportVimState();
          this.vimState = vimResult.vimState;
          return;
        }

        // Insert Mode logic
        // wait until keydown got painted to the dom
        const $childs = this.inputContainerRef.querySelectorAll('div');
        let targetNode = $childs[vimResult.vimState.cursor.line].childNodes[0];
        if (DomService.isTextNode(targetNode)) {
          if (vim.vimState.snippet) {
            const snippet = vim.vimState.snippet;
            const replaced = replaceSequenceWith(
              snippet.body.join(''),
              snippet.prefix.length,
              vim.vimState.lines[vimResult.vimState.cursor.line].text
            );
            targetNode = replaced.node as ChildNode;
          }
          vim.vimState.lines[vimResult.vimState.cursor.line].text =
            targetNode.textContent;
        }
        // Only update cursor, but not text
        // Text will be updated once insert mode is left
        this.vimState.cursor = vimResult.vimState.cursor;
        // vimResult.vimState.reportVimState();
      },
      modeChanged: (vimResult, newMode, oldMode, vim) => {
        // TODO: extract to somewhere in the core, update vimState with dom
        switch (newMode) {
          case VimMode.INSERT: {
            console.log('Enter Insert Mode');

            this.vimState = vimResult.vimState;
            this.enterInsertMode(vimResult.vimState.cursor);
            break;
          }
          case VimMode.NORMAL: {
            if (oldMode !== VimMode.INSERT) return;

            console.log('Enter Normal Mode');
            const range = SelectionService.getSingleRange();
            const updatedCursor = {
              line: vimResult.vimState.cursor.line,
              col: Math.max(range.startOffset - 1, 0), // - 1 INS -> NO, cursor moves one left
            };
            // TODO: investigate the vimCore handling of cursorLeft from IN->NO
            vim.vimState.updateCursor(updatedCursor);
            this.vimState = vimResult.vimState;
            this.enterNormalMode();
            break;
          }
          default: {
            return;
          }
        }
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

  private enterInsertMode(
    cursor: Cursor = {
      line: 0,
      col: 0,
    }
  ) {
    setTimeout(() => {
      const $childs = this.inputContainerRef.querySelectorAll('div');
      const targetNode = $childs[cursor.line].childNodes[0];
      const range = SelectionService.createRange(targetNode, cursor);

      this.inputContainerRef.contentEditable = 'true';
      this.inputContainerRef.focus();
      rangy.getSelection().setSingleRange(range);
    });
  }
  private enterNormalMode() {
    this.inputContainerRef.contentEditable = 'false';

    // STOP: When trying to setTimeout, the contenteditable border does not go away
    // setTimeout(() => { }, 0);
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
    const finalNewStart = text.length + range.startOffset - snippetLength + 1;
    const newStart = Math.max(
      finalNewStart, // account for char pressed, but not typed out
      0
    );
    range.setStart(textNode, newStart);
    range.deleteContents();
    sel.removeAllRanges();
    sel.addRange(range);

    return { node: sel.anchorNode, range };
  }
}
