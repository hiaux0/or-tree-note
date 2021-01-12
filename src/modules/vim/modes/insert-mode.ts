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
    this.vimCommandOutput.text = updatedInput;
    super.cursorRight();
    return this.vimCommandOutput;
  }

  executeCommand(commandName: string, commandValue: string): VimCommandOutput {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  shift() {
    return this.vimCommandOutput;
  }

  backspace(): VimCommandOutput {
    const updatedInput = replaceAt(
      this.vimCommandOutput.text,
      this.vimCommandOutput.cursor.col,
      ""
    );

    super.cursorLeft();
    this.vimCommandOutput.text = updatedInput;
    return this.vimCommandOutput;
  }

  delete(): VimCommandOutput {
    const updatedInput = replaceAt(
      this.vimCommandOutput.text,
      this.vimCommandOutput.cursor.col + 1,
      ""
    );

    this.vimCommandOutput.text = updatedInput;
    return this.vimCommandOutput;
  }
}
