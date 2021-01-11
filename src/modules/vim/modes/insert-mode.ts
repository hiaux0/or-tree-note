import { AbstractMode } from "./abstract-mode";
import { insert, replaceAt } from "modules/string/string";
import { VimCommandOutput, VimMode } from "../vim";

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimCommandOutput {
    const updatedInput = insert(
      this.vimCommandOutput.text,
      this.vimCommandOutput.cursor.col,
      newInput
    );
    super.cursorRight();
    return {
      text: updatedInput,
      cursor: { ...this.vimCommandOutput.cursor },
    };
  }

  executeCommand(commandName: string, commandValue: string): VimCommandOutput {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  shift() {
    return {
      text: this.vimCommandOutput.text,
      cursor: { ...this.vimCommandOutput.cursor },
    };
  }

  backspace(): VimCommandOutput {
    const updatedInput = replaceAt(
      this.vimCommandOutput.text,
      this.vimCommandOutput.cursor.col,
      ""
    );
    super.cursorLeft();
    return {
      text: updatedInput,
      cursor: { ...this.vimCommandOutput.cursor },
    };
  }

  delete(): VimCommandOutput {
    const updatedInput = replaceAt(
      this.vimCommandOutput.text,
      this.vimCommandOutput.cursor.col + 1,
      ""
    );
    return {
      text: updatedInput,
      cursor: { ...this.vimCommandOutput.cursor },
    };
  }
}
