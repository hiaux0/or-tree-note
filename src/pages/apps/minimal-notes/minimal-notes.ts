import { bindable, bindingMode } from 'aurelia-framework';
import { DomService } from 'modules/DomService';
import { SelectionService } from 'modules/SelectionService';
import { initVim } from 'modules/vim/vim-init';
import {
  Cursor,
  VimEditorOptionsV2,
  VimLine,
  VimMode,
} from 'modules/vim/vim-types';
import rangy from 'rangy';
import './minimal-notes.scss';

export class MinimalNotes {
  @bindable({ defaultBindingMode: bindingMode.fromView }) text: string;

  inputContainerRef: HTMLDivElement;
  caretRef: HTMLDivElement;
  contenteditable = true;
  currentModeName = VimMode.NORMAL;

  attached() {
    setTimeout(() => {
      this.enterNormalMode();
    }, 0);

    // this.initEventListener();
    void this.initVim();
  }

  private async initVim() {
    const texts: string[] = this.inputContainerRef.innerText.split('\n');
    const startLines: VimLine[] = texts.map((text) => ({ text }));
    const childIndex = 0;
    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      container: this.inputContainerRef,
      caret: this.caretRef,
      childSelector: 'inputLine',
      startLines,
      afterInit: (vim) => {
        vim.vimState.reportVimState();
      },
      commandListener: (vimResult, _, vim) => {
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: minimal-notes.ts ~ line 33 ~ commandListener');
        // TODO: extract to somewhere in the core, update vimState with dom
        if (vimResult.vimState.mode !== VimMode.INSERT) return;
        const $childs = this.inputContainerRef.querySelectorAll('div');
        let targetNode = $childs[childIndex].childNodes[0];

        // wait until keydown got painted to the dom
        // setTimeout(() => {
        if (DomService.isTextNode(targetNode)) {
          let range: Range;
          if (vim.vimState.snippet) {
            const snippet = vim.vimState.snippet;
            const replaced = replaceSequenceWith(
              snippet.body.join(''),
              snippet.prefix.length,
              vim.vimState.lines[childIndex].text
            );
            targetNode = replaced.node as ChildNode;
            range = replaced.range;
          }
          /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: minimal-notes.ts ~ line 52 ~ targetNode.textContent', targetNode.textContent);
          vim.vimState.lines[childIndex].text = targetNode.textContent;
          range = range ?? SelectionService.getSingleRange();
          vim.vimState.cursor.col = range.startOffset;
        }
        vim.vimState.reportVimState();
        // }, 0);
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
              line: childIndex,
              col: Math.max(range.startOffset - 1, 0),
            });
            vim.vimState.reportVimState();
            break;
          }
          default: {
            return;
          }
        }
      },
      onCompositionUpdate: (vim, event) => {
        // wait until keydown got painted to the dom
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: minimal-notes.ts ~ line 81 ~ event', event);

        const $childs = (event.target as HTMLElement).querySelectorAll('div');
        const targetNode = $childs[childIndex].childNodes[0];
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: minimal-notes.ts ~ line 81 ~ targetNode.textContent', targetNode.textContent);
        vim.vimState.updateLine(childIndex, targetNode.textContent);
        const range = SelectionService.getSingleRange();
        vim.vimState.updateCursor({ line: childIndex, col: range.startOffset });
        vim.vimState.reportVimState();
        // setTimeout(() => {
        // }, 0);
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

  private enterInsertMode(cursor?: Cursor) {
    const $childs = this.inputContainerRef.querySelectorAll('div');
    const targetNode = $childs[0].childNodes[0];
    const range = SelectionService.createRange(
      targetNode,
      cursor ?? {
        line: 0,
        col: 0,
      }
    );

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
