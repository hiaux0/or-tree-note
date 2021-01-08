import { AbstractMode } from "./modes";
import { insert } from "modules/string/string";
import { VimMode } from "../vim";

export class InsertMode extends AbstractMode {
  activeMode = VimMode.NORMAL;

  type(newInput: string) {
    const updatedInput = insert(this.activeInput, this.cursor.col, newInput);
    super.cursorRight();
    return updatedInput;
  }
}
