import { AbstractMode } from "./modes";
import { insert, replaceAt } from "modules/string/string";
import { VimMode } from "../vim";

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string) {
    const updatedInput = insert(this.activeInput, this.cursor.col, newInput);
    super.cursorRight();
    return updatedInput;
  }

  executeCommand(commandName: string, commandValue: string) {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  backspace() {
    this.activeInput;
    const updatedInput = replaceAt(this.activeInput, this.cursor.col, "");
    super.cursorLeft();
    return updatedInput;
  }

  delete() {
    this.activeInput;
    const updatedInput = replaceAt(this.activeInput, this.cursor.col + 1, "");
    return updatedInput;
  }
}
