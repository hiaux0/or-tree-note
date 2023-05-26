import { initVim } from 'modules/vim/vim-init';
import { VimLine, VimMode } from 'modules/vim/vim-types';
import './test-vn-mode.scss';

/**
 * 1. contenteditable div
 *   1. get content from the div
 *   2. update content
 * 2. normal mode with styling
 */
export class TestVnMode {
  VimMode = VimMode;
  mode: VimMode = VimMode.INSERT;
  containerRef: HTMLDivElement;
  contenteditable = this.mode === VimMode.INSERT;

  attached() {
    this.init();
  }

  private init() {
    const texts: string[] = this.containerRef.innerText.split('\n');
    const startLines: VimLine[] = texts.map((text) => ({ text }));

    void initVim({
      container: this.containerRef,
      startLines,
      afterInit: (_vim) => {
        if (this.prevent()) return;

        // const result = vim.queueInputSequence('v');
        // const result = _vim.queueInputSequence('<Control>[');
        // return result;
      },
      modeChanged: (mode) => {
        if (this.prevent()) return;

        this.mode = mode;
        this.contenteditable = this.mode === VimMode.INSERT;
      },
      commandListener: (result) => {
        if (this.prevent()) return;
        // console.clear();
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: test-vn-mode.ts ~ line 27 ~ result', result);
      },
    });
  }

  private prevent() {
    return false;
  }
}
