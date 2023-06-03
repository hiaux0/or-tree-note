import { autoinject, bindable } from 'aurelia-framework';
import * as d3 from 'd3';
import { MyNode } from 'entities/entities';
import { cloneDeep } from 'lodash';
import { initVimHtml } from 'modules/vim-html';
import { VimMode } from 'modules/vim/vim-types';

import './vim-html-connection.scss';

export const ACTIVE_CLASS = 'active';

@autoinject
export class VimHtmlConnection {
  @bindable value = 'VimHtmlConnection';

  private targetCommand: string;
  private manualActiveIndex: number;
  private readonly numOfElements = 7;
  private nodes: MyNode[] = [];
  private nodes1: MyNode[] = [];
  private isMoveMode: boolean = false;

  bind() {
    this.initNodes();
  }

  attached() {
    this.initActive();

    d3.selectAll('p').style('color', function () {
      return `hsl(${Math.random() * 360},100%,50%)`;
    });

    void initVimHtml({
      /**
       * 1. Set mode
       * 2. Movement mode
       */
      modeChanged: (_, mode) => {
        switch (mode) {
          case VimMode.NORMAL:
            this.isMoveMode = false;
            break;
          case VimMode.VISUAL:
            this.isMoveMode = true;
            break;
        }
      },
      commandListener: (result) => {
        this.targetCommand = result.targetCommand;
      },
    });
  }

  private initActive() {
    /**
     * Have to set earliest in attached for the `currentActive` getter to trigger.
     */
    this.manualActiveIndex = 2;
  }

  private initNodes() {
    const newNodes = Array.from({ length: this.numOfElements }, (_, index) => ({
      id: String(index),
    }));
    this.nodes = newNodes;
    this.nodes1 = cloneDeep(newNodes);
  }
}
