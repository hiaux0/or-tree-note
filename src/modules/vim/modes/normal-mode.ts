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

  cursorWordForwardEnd(): VimCommandOutput {
    const token = this.getTokenUnderCursor();
    if (token) {
      return {
        ...this.vimCommandOutput,
        cursor: {
          ...this.vimCommandOutput.cursor,
          col: token.end,
        },
      };
    }

    return this.vimCommandOutput;
  }
}
