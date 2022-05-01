import { autoinject, bindable, computedFrom } from 'aurelia-framework';
import * as d3 from 'd3';
import { MyNode } from 'entities/entities';
import { initVimHtml } from 'modules/vim-html';
import { VimMode } from 'modules/vim/vim-types';

import './vim-html-connection.scss';
import { NormalHtmlMovement } from './vim-html-movement/nomal-html-movement';
import { VisualHtmlMovement } from './vim-html-movement/visual-html-movement';

export const ACTIVE_CLASS = 'active';

@autoinject
export class VimHtmlConnection {
  @bindable value = 'VimHtmlConnection';

  private targetCommand: string;
  private manualActiveIndex: number;
  private readonly numOfElements = 7;
  private nodes: MyNode[] = [];
  private readonly nodesContainerRef: HTMLElement;
  private isMoveMode: boolean = false;
  private vimHtmlMode: NormalHtmlMovement | VisualHtmlMovement;

  @computedFrom('manualActiveIndex', 'nodes.length')
  private get currentActive(): HTMLElement {
    if (!this.nodesContainerRef?.children?.length) return;

    const active = Array.from(this.nodesContainerRef.children)[
      this.manualActiveIndex
    ];

    return active as HTMLElement;
  }

  @computedFrom('currentActive')
  private get currentActiveIndex() {
    const index = this.getIndexOfElement(this.currentActive);
    return index;
  }

  bind() {
    this.initNodes();
  }

  attached() {
    this.initActive();

    d3.selectAll('p').style('color', function () {
      return `hsl(${Math.random() * 360},100%,50%)`;
    });

    initVimHtml({
      modeChanged: (mode) => {
        this.vimHtmlMode = this.getMode(mode);

        if (mode === VimMode.VISUAL) {
          this.isMoveMode = true;
        }
      },
      commandListener: (result) => {
        console.clear();
        this.targetCommand = result.targetCommand;

        if (this.vimHtmlMode instanceof VisualHtmlMovement) {
          this.vimHtmlMode.setElementToMove(this.currentActive);
          const { activeIndex } = this.vimHtmlMode.handleCommand(
            result.targetCommand
          );
          this.setActiveIndex(activeIndex);
          return;
        } else if (this.vimHtmlMode instanceof NormalHtmlMovement) {
          const { nextElement } = this.vimHtmlMode.handleCommand(
            result.targetCommand
          );
          this.setActiveIndex(this.getIndexOfElement(nextElement));
        }
      },
    });
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

  private initActive() {
    /**
     * Have to set earliest in attached for the `currentActive` getter to trigger.
     */
    this.manualActiveIndex = 2;
  }

  private initNodes() {
    this.nodes = Array.from({ length: this.numOfElements }, (_, index) => ({
      id: String(index),
    }));
  }

  private setActiveIndex(newIndex: number): void {
    /**
     * Was last element? Then highlight the new last one
     */
    if (this.nodes.length === newIndex) {
      let updatedIndex = newIndex - 1;
      if (updatedIndex < 0) {
        updatedIndex = 0;
      }

      this.manualActiveIndex = updatedIndex;
      return;
    }

    if (newIndex < 0) {
      /**
       * Fallback to 0
       */
      this.manualActiveIndex = 0;
      return;
    }

    this.manualActiveIndex = newIndex;
  }

  private getIndexOfElement(element: Element | HTMLElement): number {
    const index = Array.from(this.nodesContainerRef?.children).findIndex(
      (child) => child === element
    );
    return index;
  }
}
