import {
  VimCommandNames,
  VIM_COMMAND,
} from 'modules/vim/vim-commands-repository';

import {
  CommandHandledReturn,
  HorizontalOptions,
  defaulthorizontalOptions,
} from '../vim-html-connection-types';
import { AbstractHtmlMovement } from './abstract-html-movement';

export class NormalHtmlMovement extends AbstractHtmlMovement {
  public handleCommand(targetCommand: VimCommandNames): CommandHandledReturn {
    let nextActive: HTMLElement;

    switch (targetCommand) {
      case VIM_COMMAND.cursorRight: {
        nextActive = this.getNextSibling();
        break;
      }
      case VIM_COMMAND.cursorLeft: {
        nextActive = this.getPreviousSibling();
        break;
      }
      case VIM_COMMAND.cursorUp: {
        nextActive = this.getUpSibling();
        break;
      }
      case VIM_COMMAND.cursorDown: {
        nextActive = this.getDownSibling();
        break;
      }
      case VIM_COMMAND.cursorLineStart: {
        nextActive = this.getFirstSibling();
        break;
      }
      case VIM_COMMAND.cursorLineEnd: {
        nextActive = this.getLastSibling();
        break;
      }
      // case VIM_COMMAND.indentLeft:
      //   {
      //     nextActive = this.goToParent();
      //     break;
      //   }
      // case VIM_COMMAND.indentRight:
      //   {
      //     nextActive = this.getFirstChild();
      //     break;
      //   }
      // case VIM_COMMAND.newLine: {
      //   this.addNodeAtIndex(this.currentActiveIndex);
      //   break;
      // }
      // case VIM_COMMAND.backspace: {
      //   this.removeNodeAtIndex(this.currentActiveIndex);
      //   break;
      // }
      // case VIM_COMMAND.enterNormalMode: {
      //   this.isMoveMode = false;
      //   break;
      // }
      case VIM_COMMAND.enterVisualMode: {
        // this.isMoveMode = true;
        // this.setElementToMove();
        break;
      }
    }
    return {
      nextElement: nextActive,
    };
  }

  public getPreviousSibling() {
    const sibling = super.getPreviousSibling();
    return sibling;
  }

  public getNextSibling() {
    const sibling = super.getNextSibling();
    return sibling;
  }

  /**
   * Future:
   *  0
   *  1| 2  3  <-- Should go to 0
   *  4  5  6
   */
  public getUpSibling(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const sibling = super.getUpSibling(horizontalOptions);
    return sibling;
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
    const sibling = super.getDownSibling(horizontalOptions);
    return sibling;
  }

  public getFirstSibling() {
    const sibling = super.getFirstSibling();
    return sibling;
  }

  public getLastSibling() {
    const sibling = super.getLastSibling();
    return sibling;
  }

  public goToParent(
    horizontalOptions: HorizontalOptions = defaulthorizontalOptions
  ) {
    const sibling = super.goToParent(horizontalOptions);
    return sibling;
  }

  public getFirstChild() {
    const sibling = super.getFirstChild();
    return sibling;
  }
}
