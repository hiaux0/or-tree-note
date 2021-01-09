import { AbstractMode } from "./modes";
import { insert } from "modules/string/string";
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
}
