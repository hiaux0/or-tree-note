import { AbstractMode } from "./modes";
import { insert, replaceAt } from "modules/string/string";
import { VimCommandOutput, VimMode } from "../vim";

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimCommandOutput {
    const updatedInput = insert(this.activeInput, this.cursor.col, newInput);
    super.cursorRight();
    return {
      text: updatedInput,
      cursor: { ...this.cursor },
    };
  }

  executeCommand(commandName: string, commandValue: string): VimCommandOutput {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  backspace(): VimCommandOutput {
    const updatedInput = replaceAt(this.activeInput, this.cursor.col, "");
    super.cursorLeft();
    return {
      text: updatedInput,
      cursor: { ...this.cursor },
    };
  }

  delete(): VimCommandOutput {
    const updatedInput = replaceAt(this.activeInput, this.cursor.col + 1, "");
    return {
      text: updatedInput,
      cursor: { ...this.cursor },
    };
  }
}
