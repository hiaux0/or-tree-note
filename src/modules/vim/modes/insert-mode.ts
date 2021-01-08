import { AbstractMode } from "./modes";
import { insert } from "modules/string/string";

export class InsertMode extends AbstractMode {
  type(newInput: string) {
    const updatedInput = insert(this.activeInput, this.cursor.col, newInput);
    super.cursorRight();
    return updatedInput;
  }
}
