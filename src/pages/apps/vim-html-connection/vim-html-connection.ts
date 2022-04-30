import { autoinject, bindable, computedFrom } from 'aurelia-framework';
import { getRandomId } from 'common/random';
import * as d3 from 'd3';
import { MyNode } from 'entities/entities';
import { initVimHtml } from 'modules/vim-html';
import { VIM_COMMAND } from 'modules/vim/vim-commands-repository';
import './vim-html-connection.scss';

const ACTIVE_CLASS = 'active';

type Selector = string;

interface HorizontalOptions {
  widthDelta?: number;
  highestParent?: HTMLElement | Selector;
  lowestChild?: HTMLElement | Selector;
}

const defaulthorizontalOptions: HorizontalOptions = {
  widthDelta: 0,
  highestParent: document.body,
};

@autoinject
export class VimHtmlConnection {
  @bindable value = 'VimHtmlConnection';

  private targetCommand: string;
  private line: number;
  private col: number;
  private manualActiveIndex: number;
  private readonly numOfElements = 7;
  private nodes: MyNode[] = [];
  private readonly nodesContainerRef: HTMLElement;

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
    const index = this.getIndex(this.currentActive);
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

    // d3.selectAll('p')
    //   .data([4, 8, 15, 16, 23, 42])
    //   .style('font-size', function (d) {
    //     return `${d}px`;
    //   });

    initVimHtml({
      commandListener: (result) => {
        this.targetCommand = result.targetCommand;
        this.line = result.vimState.cursor.line;
        this.col = result.vimState.cursor.col;
        console.clear();

        switch (result.targetCommand) {
          case VIM_COMMAND['cursorRight']: {
            /* this.currentActive = */ this.getNextSibling();
            break;
          }
          case VIM_COMMAND['cursorLeft']: {
            /* this.currentActive = */ this.getPreviousSibling();
            break;
          }
          case VIM_COMMAND['cursorUp']: {
            /* this.currentActive = */ this.getUpSibling();
            break;
          }
          case VIM_COMMAND['cursorDown']: {
            /* this.currentActive = */ this.getDownSibling();
            break;
          }
          case VIM_COMMAND['cursorLineStart']: {
            /* this.currentActive = */ this.getFirstSibling();
            break;
          }
          case VIM_COMMAND['cursorLineEnd']: {
            /* this.currentActive = */ this.getLastSibling();
            break;
          }
          case VIM_COMMAND['indentLeft']: {
            /* this.currentActive = */ this.goToParent();
            break;
          }
          case VIM_COMMAND['indentRight']: {
            /* this.currentActive = */ this.getFirstChild();
            break;
          }
          case VIM_COMMAND['newLine']: {
            this.addNodeAtIndex(this.currentActiveIndex);
            break;
          }
          case VIM_COMMAND.backspace: {
            this.removeNodeAtIndex(this.currentActiveIndex);
            break;
          }
        }
      },
    });
  }

  private initActive() {
    /**
     * Have to set earliest in attached for the `currentActive` getter to trigger.
     */
    this.manualActiveIndex = 6;
  }

  private initNodes() {
    this.nodes = Array.from({ length: this.numOfElements }, (_, index) => ({
      id: String(index),
    }));
  }

  /**
   * Current: Move highlight of active to new element
   * Other option: Add new element after active, and keep active one highlighted
   */
  private addNodeAtIndex(index: number): void {
    const newNode = this.createNewNode({ id: this.nodes.length.toString() });
    const afterCurrentIndex = index + 1;
    this.nodes.splice(afterCurrentIndex, 0, newNode);

    this.setActiveIndex(afterCurrentIndex);
  }

  private removeNodeAtIndex(index: number): void {
    this.nodes.splice(index, 1);

    this.setActiveIndex(index);
  }

  private createNewNode(newNode: Partial<MyNode>): MyNode {
    return {
      id: getRandomId(),
      ...newNode,
    };
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

  private getIndex(element: Element | HTMLElement): number {
    const index = Array.from(this.nodesContainerRef?.children).findIndex(
      (child) => child === element
    );
    return index;
  }

  private getPreviousSibling() {
    const $currentActive = document.querySelector('.active');
    let $previousActive = $currentActive.previousElementSibling;
    if ($previousActive === null) {
      console.log('No element found, circle back?');
      $previousActive = $currentActive.parentElement.lastElementChild;
    }

    this.setActiveIndex(this.getIndex($previousActive));

    return $previousActive as HTMLElement;
  }

  private getNextSibling() {
    const $currentActive = document.querySelector('.active');
    let $nextActive = $currentActive.nextElementSibling;
    if ($nextActive === null) {
      console.log('No element found, circle back?');
      $nextActive = $currentActive.parentElement.firstElementChild;
    }

    this.setActiveIndex(this.getIndex($nextActive));

    return $nextActive as HTMLElement;
  }

  /**
   * Future:
   *  0
   *  1| 2  3  <-- Should go to 0
   *  4  5  6
   */
  private getUpSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const { widthDelta } = horizontalOptions;
    const $currentActive = document.querySelector('.active');
    const $child = $currentActive.parentElement;
    const curRect = $currentActive.getBoundingClientRect();

    const $upActive = Array.from($child.children)
      .reverse()
      .find((sibling) => {
        if (sibling === $currentActive) return false;

        const siblingRect = sibling.getBoundingClientRect();
        const isAbove = curRect.top >= siblingRect.bottom;
        const isInWidthInterval_Left =
          curRect.left - widthDelta <= siblingRect.left;
        const isInWidthInterval_Right =
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          curRect.right + widthDelta >= siblingRect.right;
        const isInWidthInterval =
          isInWidthInterval_Left && isInWidthInterval_Right;

        if (isAbove && isInWidthInterval) {
          return true;
        }

        return false;
      });

    if ($upActive) {
      this.setActiveIndex(this.getIndex($upActive));
    }

    return $upActive as HTMLElement;
  }

  /**
   * Future:
   *  0  1  2
   *  3  4 |5   <-- should go to 6
   *  6
   */
  private getDownSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const { widthDelta } = horizontalOptions;
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const curRect = $currentActive.getBoundingClientRect();

    const $downActive = Array.from($parent.children).find((sibling) => {
      if (sibling === $currentActive) return false;

      const siblingRect = sibling.getBoundingClientRect();
      const isBelow = curRect.top <= siblingRect.top; // curRect.top: Allow slightly below. Future: option for fullBelow?
      const isInWidthInterval_Left =
        curRect.left - widthDelta <= siblingRect.left;
      const isInWidthInterval_Right =
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        curRect.right + widthDelta >= siblingRect.right;
      const isInWidthInterval =
        isInWidthInterval_Left && isInWidthInterval_Right;

      if (isBelow && isInWidthInterval) {
        return true;
      }

      return false;
    });

    if ($downActive) {
      this.setActiveIndex(this.getIndex($downActive));
    }

    return $downActive as HTMLElement;
  }

  private getFirstSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $firstActive = $parent.firstElementChild;

    if ($firstActive === $currentActive) return;

    this.setActiveIndex(this.getIndex($firstActive));

    return $firstActive as HTMLElement;
  }

  private getLastSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $lastActive = $parent.lastElementChild;

    if ($lastActive === $currentActive) return;

    this.setActiveIndex(this.getIndex($lastActive));

    return $lastActive as HTMLElement;
  }

  private goToParent(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const { highestParent } = horizontalOptions;
    const $currentActive = document.querySelector('.active');
    if ($currentActive === highestParent) return;
    const $parent = $currentActive.parentElement;
    if ($parent == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $parent.classList.add(ACTIVE_CLASS);

    return $parent;
  }

  private getFirstChild() {
    const $currentActive = document.querySelector('.active');
    const $child = $currentActive.firstElementChild;
    if ($child == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $child.classList.add(ACTIVE_CLASS);

    return $child as HTMLElement;
  }
}
