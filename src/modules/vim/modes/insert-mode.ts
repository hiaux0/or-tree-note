import { insert, replaceAt } from 'modules/string/string';
import { isSpace } from 'resources/keybindings/key-bindings';

import { SPACE } from '../../../resources/keybindings/app-keys';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimStateClass {
    if (isSpace(newInput)) {
      newInput = ' ';
    }

    const updatedInput = insert(
      this.vimState.getActiveLine().text,
      this.vimState.cursor.col,
      newInput
    );
    this.vimState.updateActiveLine(updatedInput);

    this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
    super.cursorRight();
    return this.vimState;
  }

  async executeCommand(
    commandName: string,
    commandValue: string
  ): Promise<VimStateClass> {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  shift() {
    return this.vimState;
  }

  backspace(): VimStateClass {
    const afterCursor = this.vimState.cursor.col - 1;
    const updatedInput = replaceAt(
      this.vimState.getActiveLine().text,
      afterCursor,
      ''
    );

    // If start of line, then join with previous
    if (afterCursor < 0) {
      this.joinLine();
    } else {
      /** PERF: don't change input, when nothing changed */
      this.vimState.updateActiveLine(updatedInput);
      this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
      super.cursorLeft();
    }

    return this.vimState;
  }

  space(): VimStateClass {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 53 ~ space');
    return this.type(SPACE);
    // return this.vimState;
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 51 ~ space');
  }
}
