import { Logger } from "modules/debug/logger";
import { VimCommandOutput, VimMode } from "../vim";
import { AbstractMode, TokenizedString } from "./abstract-mode";

const logger = new Logger({ scope: "NormalMode" });

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(commandName: string, commandValue: string): VimCommandOutput {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  getTokenUnderCursor(): TokenizedString | undefined {
    const targetToken = this.tokenizedInput.find((input) => {
      const curCol = this.vimCommandOutput.cursor.col;
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

  cursorWordForwardEnd(): VimCommandOutput {
    let currentToken = this.getTokenUnderCursor();
    const isAtEnd = currentToken.end === this.vimCommandOutput.cursor.col; /*?*/

    let resultCol;
    if (isAtEnd) {
      const nextToken = this.getTokenAtIndex(currentToken.index + 1); /*?*/
      resultCol = nextToken.end;
    } else {
      resultCol = currentToken.end;
    }

    if (currentToken) {
      this.vimCommandOutput.cursor.col = resultCol;
    }

    return this.vimCommandOutput;
  }
}
