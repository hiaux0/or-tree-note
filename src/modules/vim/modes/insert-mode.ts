import { AbstractMode } from "./abstract-mode";
import { insert, replaceAt } from "modules/string/string";
import { VimState, VimMode } from "../vim";

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimState {
    const updatedInput = insert(
      this.vimState.text,
      this.vimState.cursor.col,
      newInput
    );
    this.vimState.text = updatedInput;
    super.cursorRight();
    return this.vimState;
  }

  executeCommand(commandName: string, commandValue: string): VimState {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  shift() {
    return this.vimState;
  }

  backspace(): VimState {
    const updatedInput = replaceAt(
      this.vimState.text,
      this.vimState.cursor.col,
      ""
    );

    super.cursorLeft();
    this.vimState.text = updatedInput;
    return this.vimState;
  }

  delete(): VimState {
    const updatedInput = replaceAt(
      this.vimState.text,
      this.vimState.cursor.col + 1,
      ""
    );

    this.vimState.text = updatedInput;
    return this.vimState;
  }
}
