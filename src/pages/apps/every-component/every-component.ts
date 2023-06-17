import { bindable } from 'aurelia-framework';
import './every-component.scss';
import { VimMode, VimStateV2 } from 'modules/vim/vim-types';

import { testVimState } from './vim/vimCore/VimCoreV2';
import { VimInputHandler } from './vim/vimUi/VimInputHandler';

export class EveryComponent {
  @bindable value = 'EveryComponent';
  private readonly containerRef: HTMLDivElement;
  private readonly noteContainerRef: HTMLDivElement;
  private mode = VimMode.INSERT;
  vimInputHandler: VimInputHandler;
  private vimState: VimStateV2 = testVimState;
  private tempVimStateInsertMode: VimStateV2;

  attached() {
    this.tempVimStateInsertMode = this.vimState;
    // this.test();
    // return;

    this.vimInputHandler = new VimInputHandler({
      container: this.noteContainerRef,
      childSelector: 'inputLine',
      commandListener: (vimResult) => {},
      commandListenerv2: (vimResult) => {
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:35 ~ vimResult:', vimResult);
        requestAnimationFrame(() => {
          this.tempVimStateInsertMode = vimResult.vimState;
        });
      },
      modeChangedv2: (vimResult) => {
        this.mode = vimResult.vimState.mode;

        requestAnimationFrame(() => {
          this.updateVimState();
        });
      },
    });
    // this.vimInputHandler.init();
  }

  private updateVimState() {
    // VimState
    this.vimState = this.tempVimStateInsertMode;
    // DOM Cursor
  }

  test() {
    const domUpdateQueue: (() => void)[] = [];

    // Step 2: Enqueue DOM updates in the "keydown" event handler
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 's') {
        event.preventDefault();

        // Step 3: Get the updated input with the typed "s" to update the text renderer
        const updatedInput = event.target as HTMLElement;
        const typedCharacter = 's';
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:41 ~ typedCharacter:', typedCharacter);

        // Enqueue DOM update
        domUpdateQueue.push(() => {
          // Step 4: Update the native DOM with the text renderer data
          updatedInput.textContent += typedCharacter;
          /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: every-component.ts:47 ~ updatedInput.textContent:', updatedInput.textContent);
        });

        // Step 5: Schedule the DOM update function using requestAnimationFrame
        requestAnimationFrame(updateDOM);
      }
    }

    // Step 3: Create a function to handle the DOM updates
    function updateDOM() {
      // Step 5: Execute the DOM updates from the queue
      while (domUpdateQueue.length > 0) {
        const update = domUpdateQueue.shift();
        update?.();
      }
    }

    this.noteContainerRef.addEventListener('keydown', handleKeyDown);
  }
}
