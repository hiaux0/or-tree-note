import { VimCommandNames } from 'modules/vim/vim-commands-repository';

import { ACTIVE_CLASS } from '../vim-html-connection';
import {
  CommandHandledReturn,
  HorizontalOptions,
  defaulthorizontalOptions,
} from '../vim-html-connection-types';

export abstract class AbstractHtmlMovement {
  public handleCommand(targetCommand: VimCommandNames): CommandHandledReturn {
    throw new Error(`Should handle ${targetCommand} in derived class.`);
  }

  public getPreviousSibling() {
    const $currentActive = document.querySelector('.active');
    let $previousActive = $currentActive.previousElementSibling;
    if ($previousActive === null) {
      console.log('No element found, circle back?');
      $previousActive = $currentActive.parentElement.lastElementChild;
    }

    return $previousActive as HTMLElement;
  }

  public getNextSibling() {
    const $currentActive = document.querySelector('.active');
    let $nextActive = $currentActive.nextElementSibling;
    if ($nextActive === null) {
      console.log('No element found, circle back?');
      $nextActive = $currentActive.parentElement.firstElementChild;
    }

    return $nextActive as HTMLElement;
  }

  /**
   * Future:
   *  0
   *  1| 2  3  <-- Should go to 0
   *  4  5  6
   */
  public getUpSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ): HTMLElement | undefined {
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

    if ($upActive === undefined) return;

    return $upActive as HTMLElement;
  }

  /**
   * Future:
   *  0  1  2
   *  3  4 |5   <-- should go to 6
   *  6
   */
  public getDownSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const { widthDelta } = horizontalOptions;
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const curRect = $currentActive.getBoundingClientRect();

    const $downActive = Array.from($parent.children).find((sibling) => {
      if (sibling === $currentActive) return false;

      const siblingRect = sibling.getBoundingClientRect();
      const isBelow = curRect.top <= siblingRect.top; // <=: Allow slightly below. Future: option for fullBelow?
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

    return $downActive as HTMLElement;
  }

  public getFirstSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $firstActive = $parent.firstElementChild;

    if ($firstActive === $currentActive) return;

    return $firstActive as HTMLElement;
  }

  public getLastSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $lastActive = $parent.lastElementChild;

    if ($lastActive === $currentActive) return;

    return $lastActive as HTMLElement;
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
