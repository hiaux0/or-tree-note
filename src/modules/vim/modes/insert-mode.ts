import { insert, replaceAt } from 'modules/string/string';

import { SPACE } from '../../../resources/keybindings/app-keys';
import { VimStateClass } from '../vim-state';
import { VimState, VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;

  type(newInput: string): VimStateClass {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 12 ~ newInput', newInput);
    if (newInput === SPACE) {
      newInput = ' ';
    }

    const updatedInput = insert(
      this.vimState.getActiveLine(),
      this.vimState.cursor.col,
      newInput
    );
    this.vimState.updateActiveLine(updatedInput);

    this.lines[this.vimState.cursor.line] = updatedInput;
    super.cursorRight();
    return this.vimState;
  }

  executeCommand(commandName: string, commandValue: string): VimStateClass {
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 30 ~ commandName', commandName);
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

    super.cursorLeft();
    // this.vimState.getActiveLine() = updatedInput;
    throw 'TODO: vimstate.text refactor'; /* ? */

    return this.vimState;
  }

  space(): VimStateClass {
    return this.type(SPACE);
    // return this.vimState;
    // /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: insert-mode.ts ~ line 51 ~ space');
  }
}
