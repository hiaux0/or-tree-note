import {
  bindable,
  computedFrom,
  containerless,
  inject,
} from 'aurelia-framework';
import { MyNode } from 'entities/entities';
import { initVimHtml } from 'modules/vim-html';
import { VimMode } from 'modules/vim/vim-types';

import { ACTIVE_CLASS } from '../vim-html-connection';
import { NormalHtmlMovement } from '../vim-html-movement/nomal-html-movement';
import { VisualHtmlMovement } from '../vim-html-movement/visual-html-movement';
import './vim-html.scss';

@inject(Element)
@containerless()
export class VimHtml {
  @bindable id: string;
  @bindable nodes: MyNode[] = [];
  @bindable activeIndex: number;
  @bindable childSelector: string;

  private mode: VimMode = VimMode.NORMAL;
  private vimHtmlMode: NormalHtmlMovement | VisualHtmlMovement =
    new NormalHtmlMovement();
  private readonly nodesContainerRef: HTMLElement;
  currentVimHtmlId: string;

  @computedFrom('activeIndex', 'nodes.length')
  private get currentActive(): HTMLElement {
    if (!this.nodesContainerRef?.children?.length) return;

    const active = Array.from(this.nodesContainerRef.children)[
      this.activeIndex
    ];

    return active as HTMLElement;
  }

  constructor(private readonly element: HTMLElement) {}

  attached() {
    void initVimHtml({
      afterInit: (_vim) => {
        if (this.prevent()) return;

        // const result = vim.queueInputSequence('v');
        const result = _vim.queueInputSequence('<Control>[');
        return result;
      },
      modeChanged: (mode) => {
        if (this.prevent()) return;

        this.vimHtmlMode = this.getMode(mode);
        this.mode = mode;
      },
      commandListener: (result) => {
        if (this.prevent()) return;
        console.clear();

        if (this.vimHtmlMode instanceof VisualHtmlMovement) {
          this.vimHtmlMode.setElementToMove(this.currentActive);
          const { activeIndex } = this.vimHtmlMode.handleCommand(
            result.targetCommand
          );
          this.setActiveIndex(activeIndex);
          return;
        } else if (this.vimHtmlMode instanceof NormalHtmlMovement) {
          const { currentElement, nextElement } =
            this.vimHtmlMode.handleCommand(result.targetCommand);

          if (this.getVimHtmlId(nextElement)) {
            this.currentVimHtmlId = this.getVimHtmlId(nextElement);
            // /* prettier-ignore */ console.log('TCL ~ file: vim-html.ts ~ line 74 ~ VimHtml ~ attached ~ this.currentVimHtmlId', this.currentVimHtmlId);
          }
          // /* prettier-ignore */ console.log('TCL ~ file: vim-html.ts ~ line 63 ~ VimHtml ~ attached ~ nextElement', nextElement);

          /**
           * If just any HTML element, then do general highlighl
           */
          if (!nextElement.classList.contains(this.childSelector)) {
            currentElement.classList.remove(ACTIVE_CLASS);
            nextElement.classList.add(ACTIVE_CLASS);
          }

          if (!nextElement) return;
          const elementIndex = this.getIndexOfElement(nextElement);
          this.setActiveIndex(elementIndex);
        }
      },
    });
  }

  private getVimHtmlId(nextElement: HTMLElement): string {
    return nextElement.dataset.vimHtmlId;
  }

  private prevent() {
    this.currentVimHtmlId = 'first';
    // const target = 'second';
    // const shouldPrevent = this.element.dataset.vimHtmlId !== target;
    const shouldPrevent = this.id !== this.currentVimHtmlId;
    /* prettier-ignore */ console.log('TCL ~ file: vim-html.ts ~ line 86 ~ VimHtml ~ prevent ~ this.id', this.id);
    return shouldPrevent;
  }

  private getMode<Mode extends VimMode>(
    mode: Mode
  ): Mode extends VimMode.NORMAL
    ? NormalHtmlMovement
    : Mode extends VimMode.VISUAL
    ? VisualHtmlMovement
    : never {
    let finalMode;
    switch (mode) {
      case VimMode.NORMAL: {
        finalMode = new NormalHtmlMovement();
        break;
      }
      case VimMode.VISUAL: {
        finalMode = new VisualHtmlMovement(this.nodes, this.nodesContainerRef);
        break;
      }
    }

    return finalMode;
  }

  private setActiveIndex(newIndex: number | undefined): void {
    if (newIndex === undefined) return;

    /**
     * Was last element? Then highlight the new last one
     */
    if (this.nodes.length === newIndex) {
      let updatedIndex = newIndex - 1;
      if (updatedIndex < 0) {
        updatedIndex = 0;
      }

      this.activeIndex = updatedIndex;
      return;
    }

    // if (newIndex < 0) {
    //   /**
    //    * Fallback to 0
    //    */
    //   this.activeIndex = 0;
    //   return;
    // }

    this.activeIndex = newIndex;
    /* prettier-ignore */ console.log('TCL ~ file: vim-html.ts ~ line 131 ~ VimHtml ~ setActiveIndex ~ this.activeIndex', this.activeIndex);
  }

  private getIndexOfElement(element: Element | HTMLElement): number {
    const index = Array.from(this.nodesContainerRef?.children).findIndex(
      (child) => child === element
    );
    return index;
  }
}
