import { insert, replaceAt } from 'modules/string/string';
import { isSpace, Modifier } from 'resources/keybindings/key-bindings';

import { SPACE } from '../../../resources/keybindings/app-keys';
import { VimStateClass } from '../vim-state';
import { VimState, VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimStateClass {
    if (isSpace(newInput)) {
      newInput = ' ';
    }

    const updatedInput = insert(
      this.vimState.getActiveLine(),
      this.vimState.cursor.col,
      newInput
    );
    this.vimState.updateActiveLine(updatedInput);

    this.vimState.lines[this.vimState.cursor.line] = updatedInput;
    super.cursorRight();
    return this.vimState;
  }

  executeCommand(commandName: string, commandValue: string): VimStateClass {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }

  shift() {
    return this.vimState;
  }

  backspace(): VimStateClass {
    const updatedInput = replaceAt(
      this.vimState.getActiveLine(),
      this.vimState.cursor.col - 1,
      ''
    );

    this.vimState.updateActiveLine(updatedInput);

    this.vimState.lines[this.vimState.cursor.line] = updatedInput;
    super.cursorLeft();
    // this.vimState.getActiveLine() = updatedInput;
    return this.vimState;
    throw 'TODO: vimstate.text refactor'; /* ? */

    return this.vimState;
  }

  space(): VimStateClass {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 53 ~ space');
    return this.type(SPACE);
    // return this.vimState;
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 51 ~ space');
  }
}
