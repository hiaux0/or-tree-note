import { autoinject, bindable } from 'aurelia-framework';
import { initVimHtml } from 'modules/vim-html';
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
  private readonly activeIndex: number = 0;
  private readonly numOfElements = 7;

  attached() {
    initVimHtml({
      commandListener: (result) => {
        this.targetCommand = result.targetCommand;
        this.line = result.vimState.cursor.line;
        this.col = result.vimState.cursor.col;
        console.clear();

        switch (result.targetCommand) {
          case 'cursorRight': {
            this.getNextSibling();
            break;
          }
          case 'cursorLeft': {
            this.getPreviousSibling();
            break;
          }
          case 'cursorUp': {
            this.getUpSibling();
            break;
          }
          case 'cursorDown': {
            this.getDownSibling();
            break;
          }
          case 'cursorLineStart': {
            this.getFirstSibling();
            break;
          }
          case 'cursorLineEnd': {
            this.getLastSibling();
            break;
          }
          case 'indentLeft': {
            this.goToParent();
            break;
          }
          case 'indentRight': {
            this.getFirstChild();
            break;
          }
        }
      },
    });
  }

  private getPreviousSibling() {
    const $currentActive = document.querySelector('.active');
    let $previousActive = $currentActive.previousElementSibling;
    if ($previousActive === null) {
      console.log('No element found, circle back?');
      $previousActive = $currentActive.parentElement.lastElementChild;
    }

    $currentActive.classList.remove(ACTIVE_CLASS);
    $previousActive.classList.add(ACTIVE_CLASS);
  }

  private getNextSibling() {
    const $currentActive = document.querySelector('.active');
    let $nextActive = $currentActive.nextElementSibling;
    if ($nextActive === null) {
      console.log('No element found, circle back?');
      $nextActive = $currentActive.parentElement.firstElementChild;
    }

    $currentActive.classList.remove(ACTIVE_CLASS);
    $nextActive.classList.add(ACTIVE_CLASS);
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
      $currentActive.classList.remove(ACTIVE_CLASS);
      $upActive.classList.add(ACTIVE_CLASS);
    }
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
      $currentActive.classList.remove(ACTIVE_CLASS);
      $downActive.classList.add(ACTIVE_CLASS);
    }
  }

  private getFirstSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $firstActive = $parent.firstElementChild;

    if ($firstActive === $currentActive) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $firstActive.classList.add(ACTIVE_CLASS);
  }

  private getLastSibling() {
    const $currentActive = document.querySelector('.active');
    const $parent = $currentActive.parentElement;
    const $lastActive = $parent.lastElementChild;

    if ($lastActive === $currentActive) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $lastActive.classList.add(ACTIVE_CLASS);
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
  }

  private getFirstChild() {
    const $currentActive = document.querySelector('.active');
    const $child = $currentActive.firstElementChild;
    if ($child == null) return;

    $currentActive.classList.remove(ACTIVE_CLASS);
    $child.classList.add(ACTIVE_CLASS);
  }
}
