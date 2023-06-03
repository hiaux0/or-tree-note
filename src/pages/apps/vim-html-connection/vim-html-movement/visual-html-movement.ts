import { getRandomId } from 'common/random';
import { MyNode } from 'entities/entities';
import {
  VimCommandNames,
  VIM_COMMAND,
} from 'modules/vim/vim-commands-repository';

import { ACTIVE_CLASS } from '../vim-html-connection';
import {
  CommandHandledReturn,
  HorizontalOptions,
  defaulthorizontalOptions,
} from '../vim-html-connection-types';
import { AbstractHtmlMovement } from './abstract-html-movement';

export class VisualHtmlMovement extends AbstractHtmlMovement {
  manualActiveIndex: number;
  isMoveMode: boolean = true;
  elementToMove: HTMLElement;

  constructor(
    private readonly nodes: MyNode[],
    private readonly nodesContainerRef: HTMLElement
  ) {
    super();
  }

  public handleCommand(targetCommand: VimCommandNames): CommandHandledReturn {
    let commandHandledReturn: CommandHandledReturn;

    switch (targetCommand) {
      case VIM_COMMAND.cursorRight: {
        commandHandledReturn = this.moveRight();
        break;
      }
      case VIM_COMMAND.cursorLeft: {
        commandHandledReturn = this.moveLeft();
        break;
      }
      case VIM_COMMAND.cursorUp: {
        commandHandledReturn = this.moveUp();
        break;
      }
      case VIM_COMMAND.cursorDown: {
        commandHandledReturn = this.moveDown();
        break;
      }
      case VIM_COMMAND.cursorLineStart: {
        commandHandledReturn = this.moveStart();
        break;
      }
      case VIM_COMMAND.cursorLineEnd: {
        commandHandledReturn = this.moveEnd();
        break;
      }
    }

    return commandHandledReturn;
  }

  public setElementToMove(elementToMove: HTMLElement): void {
    this.elementToMove = elementToMove;
  }

  /**
   * Current: Move highlight of active to new element
   * Other option: Add new element after active, and keep active one highlighted
   */
  private addNodeAtIndex(index: number, newNode?: MyNode): void {
    if (newNode === undefined) {
      newNode = this.createNewNode({ id: this.nodes.length.toString() });
    }

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

  private getElementAtIndex(index: number): HTMLElement {
    return Array.from(this.nodesContainerRef.children)[index] as HTMLElement;
  }

  private getIndex(element: Element | HTMLElement): number {
    const index = Array.from(this.nodesContainerRef?.children).findIndex(
      (child) => child === element
    );
    return index;
  }

  public moveLeft() {
    const $currentActive = document.querySelector('.active');
    let $previousActive = $currentActive.previousElementSibling;
    if ($previousActive === null) {
      console.log('No element found, circle back?');
      $previousActive = $currentActive.parentElement.lastElementChild;
    }

    this.removeNodeAtIndex(this.getIndex($currentActive));
    const prevIndex = this.getIndex($previousActive);
    this.addNodeAtIndex(
      prevIndex - 1,
      this.createNewNode({
        id: this.elementToMove.textContent,
      })
    );

    return {
      activeIndex: prevIndex,
    };
  }

  public moveRight(): CommandHandledReturn {
    /* prettier-ignore */ console.log('TCL ~ file: vim-html-connection.ts ~ line 326 ~ VisualHtmlMovement ~ getNextSibling ~ getNextSibling');
    const $currentActive = document.querySelector('.active');
    let $nextActive = $currentActive.nextElementSibling;
    if ($nextActive === null) {
      console.log('No element found, circle back?');
      $nextActive = $currentActive.parentElement.firstElementChild;
    }

    this.removeNodeAtIndex(this.getIndex($currentActive));
    const nextIndex = this.getIndex($nextActive);
    this.addNodeAtIndex(
      nextIndex - 1,
      this.createNewNode({
        id: this.elementToMove.textContent,
      })
    );
    this.manualActiveIndex = nextIndex;

    return {
      activeIndex: nextIndex,
    };
  }

  /**
   * Future:
   *  0
   *  1| 2  3  <-- Should go to 0
   *  4  5  6
   */
  public moveUp(
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
          curRect.right + widthDelta >= siblingRect.right;
        const isInWidthInterval =
          isInWidthInterval_Left && isInWidthInterval_Right;

        if (isAbove && isInWidthInterval) {
          return true;
        }

        return false;
      });

    if ($upActive) {
      this.removeNodeAtIndex(this.getIndex($currentActive));
      const upIndex = this.getIndex($upActive);
      this.addNodeAtIndex(
        upIndex - 1,
        this.createNewNode({
          id: this.elementToMove.textContent,
        })
      );
      this.manualActiveIndex = upIndex;

      return {
        activeIndex: upIndex,
      };
    }

    return {};
  }

  /**
   * Future:
   *  0  1  2
   *  3  4 |5   <-- should go to 6
   *  6
   */
  public moveDown(
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
        curRect.right + widthDelta >= siblingRect.right;
      const isInWidthInterval =
        isInWidthInterval_Left && isInWidthInterval_Right;

      if (isBelow && isInWidthInterval) {
        return true;
      }

      return false;
    });

    if ($downActive) {
      this.removeNodeAtIndex(this.getIndex($currentActive));
      const downIndex = this.getIndex($downActive);
      this.addNodeAtIndex(
        downIndex - 1,
        this.createNewNode({
          id: this.elementToMove.textContent,
        })
      );
      this.manualActiveIndex = downIndex;

      return {
        activeIndex: downIndex,
      };
    }

    return {};
  }

  public moveStart() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $firstActive = $parent.firstElementChild;

    if ($firstActive === $currentActive) return;

    this.removeNodeAtIndex(this.getIndex($currentActive));
    const moveToIndex = this.getIndex($firstActive);
    this.addNodeAtIndex(
      moveToIndex - 1,
      this.createNewNode({
        id: this.elementToMove.textContent,
      })
    );

    return {
      activeIndex: moveToIndex,
    };
  }

  public moveEnd() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $lastActive = $parent.lastElementChild;

    if ($lastActive === $currentActive) return;

    this.removeNodeAtIndex(this.getIndex($currentActive));
    const moveToIndex = this.getIndex($lastActive);
    this.addNodeAtIndex(
      moveToIndex - 1,
      this.createNewNode({
        id: this.elementToMove.textContent,
      })
    );

    return {
      activeIndex: moveToIndex,
    };
  }

  public goToParent(
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

  public getFirstChild() {
    const $currentActive = document.querySelector('.active');
    const $child = $currentActive.firstElementChild;
    if ($child == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $child.classList.add(ACTIVE_CLASS);

    return $child as HTMLElement;
  }
}
