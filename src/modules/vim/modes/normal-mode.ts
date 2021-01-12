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
    const targetToken = this.tokenizedInput[index];
    return targetToken;
  }

  cursorWordForwardEnd(): VimCommandOutput {
    let token = this.getTokenUnderCursor();
    const isAtEnd = token.end === this.vimCommandOutput.cursor.col;

    let resultCol;
    if (isAtEnd) {
      token = this.getTokenAtIndex(token.index + 1);
      resultCol = token.end - 1;
    } else {
      resultCol = token.end;
    }

    if (token) {
      return {
        ...this.vimCommandOutput,
        cursor: {
          ...this.vimCommandOutput.cursor,
          col: resultCol,
        },
      };
    }

    return this.vimCommandOutput;
  }
}
