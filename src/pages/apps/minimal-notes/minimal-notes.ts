import { bindable, bindingMode } from 'aurelia-framework';
import { DomService } from 'modules/DomService';
import { SelectionService } from 'modules/SelectionService';
import { initVim } from 'modules/vim/vim-init';
import { Cursor, VimEditorOptionsV2, VimMode } from 'modules/vim/vim-types';
import rangy from 'rangy';
import { ESCAPE } from 'resources/keybindings/app-keys';
import './minimal-notes.scss';

export class MinimalNotes {
  @bindable({ defaultBindingMode: bindingMode.fromView }) text: string;

  containerRef: HTMLDivElement;
  contenteditable = true;
  mode = VimMode.INSERT;
  commandListenerVimResult: import('/home/hdn/dev/repos/or-tree-note/src/modules/vim/vim-types').QueueInputReturn;
  modeChangedVimResult: import('/home/hdn/dev/repos/or-tree-note/src/modules/vim/vim-types').QueueInputReturn;

  attached() {
    setTimeout(() => {
      this.enterInsertMode();
    }, 0);

    // this.initEventListener();
    void this.initVim();
  }

  private async initVim() {
    const vimEditorOptionsV2: VimEditorOptionsV2 = {
      container: this.containerRef,
      commandListener: (vimResult, _, vim) => {
        this.commandListenerVimResult = vimResult;
        // update vimState with dom
        setTimeout(() => {
          // vimResult.vimState.reportVimState();
          const $childs = this.containerRef.querySelectorAll('div');
          const childIndex = 0;
          let targetNode = $childs[childIndex].childNodes[0];

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
            vim.vimState.lines[childIndex].text = targetNode.textContent;
            range = range ?? SelectionService.getSingleRange();
            vim.vimState.cursor.col = range.startOffset;
            vimResult.vimState.reportVimState();
          }
        });
      },
      modeChanged: (vimResult, newMode, vim) => {
        this.modeChangedVimResult = vimResult;
        switch (newMode) {
          case VimMode.INSERT: {
            console.log('Enter Insert Mode');
            this.enterInsertMode(vimResult.vimState.cursor);
            break;
          }
          case VimMode.NORMAL: {
            console.log('Enter Normal Mode');
            this.enterNormalMode();
            vim.vimState.reportVimState();
            break;
          }
          default: {
            return;
          }
        }
      },
    };
    await initVim(vimEditorOptionsV2);
  }

  private initEventListener() {
    this.containerRef.addEventListener('keydown', (ev) => {
      switch (ev.key) {
        case ESCAPE: {
          console.log('Enter normal mode');
          break;
        }
        default: {
          console.log(ev.key, ' not handled yet');
        }
      }
      this.updateText();
    });
  }

  updateText() {
    this.text = this.containerRef.innerText;
  }

  private enterInsertMode(cursor?: Cursor) {
    const $childs = this.containerRef.querySelectorAll('div');
    const targetNode = $childs[0].childNodes[0];
    const range = SelectionService.createRange(
      targetNode,
      cursor ?? {
        line: 0,
        col: 0,
      }
    );

    setTimeout(() => {
      this.containerRef.contentEditable = 'true';
      this.containerRef.focus();
      rangy.getSelection().setSingleRange(range);
    });
  }
  private enterNormalMode() {
    this.containerRef.contentEditable = 'false';
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
