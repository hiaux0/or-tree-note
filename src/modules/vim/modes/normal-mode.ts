import { VimCommandOutput, VimMode } from "../vim";
import { AbstractMode, TokenizedString } from "./abstract-mode";

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
