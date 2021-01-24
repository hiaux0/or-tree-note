import { Logger } from "modules/debug/logger";
import { VimCommandNames } from "../vim-commands";
import { VimState, VimMode } from "../vim.types";
import { AbstractMode, TokenizedString } from "./abstract-mode";

const logger = new Logger({ scope: "NormalMode" });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(
    commandName: VimCommandNames,
    commandValue?: string
  ): VimState {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  getTokenUnderCursor(): TokenizedString | undefined {
    const targetToken = this.tokenizedInput.find((input) => {
      const curCol = this.vimState.cursor.col;
      const isUnderCursor = input.start <= curCol && curCol <= input.end;

      return isUnderCursor;
    });

    logger.debug(["Token under curor: %o", targetToken], {
      onlyVerbose: true,
    });

    return targetToken;
  }

  getTokenAtIndex(index: number) {
    if (index < 0) {
      index = 0;
    } else if (index > this.tokenizedInput.length - 1) {
      index = this.tokenizedInput.length - 1;
    }

    const targetToken = this.tokenizedInput[index];

    return targetToken;
  }

  getNexToken() {
    const curCol = this.vimState.cursor.col;
    const currentTokenIndex = this.tokenizedInput.findIndex((input) => {
      return input.end <= curCol;
    });
    const targetToken = this.tokenizedInput[currentTokenIndex + 1];

    if (!targetToken) {
      logger.debug(["Could not find next target token: %o", targetToken], {
        isError: true,
      });
    }
    return targetToken;
  }

  getPreviousToken() {
    const curCol = this.vimState.cursor.col;
    const currentToken = this.tokenizedInput.find((input) => {
      return input.end <= curCol;
    });

    if (!currentToken) {
      logger.debug(["Could not find next target token: %o", currentToken], {
        isError: true,
      });
    }
    return currentToken;
  }

  cursorWordForwardEnd(): VimState {
    let tokenUnderCursor = this.getTokenUnderCursor();

    const isAtEnd = tokenUnderCursor?.end === this.vimState.cursor.col;
    const isNotAtEnd = tokenUnderCursor === undefined;

    let resultCol;
    if (isAtEnd) {
      const nextToken = this.getTokenAtIndex(tokenUnderCursor.index + 1);
      resultCol = nextToken.end;
    } else if (isNotAtEnd) {
      const nextToken = this.getNexToken();
      resultCol = nextToken.end;
    } else {
      resultCol = tokenUnderCursor.end;
    }
    resultCol;

    if (resultCol) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }

  cursorBackwordsStartWord(): VimState {
    let tokenUnderCursor = this.getTokenUnderCursor(); /*?*/

    this.vimState.cursor; /*?*/
    const isAtStart =
      tokenUnderCursor?.start === this.vimState.cursor.col; /*?*/
    const tokenNotUnderCursor = tokenUnderCursor === undefined;

    let resultCol;
    if (isAtStart) {
      const previousToken = this.getTokenAtIndex(tokenUnderCursor.index - 1);
      resultCol = previousToken.start;
    } else if (tokenNotUnderCursor) {
      const nextToken = this.getPreviousToken();
      resultCol = nextToken.start;
    } else {
      resultCol = tokenUnderCursor.start;
    }

    if (resultCol !== undefined) {
      this.vimState.cursor.col = resultCol;
    }

    return this.vimState;
  }
}
