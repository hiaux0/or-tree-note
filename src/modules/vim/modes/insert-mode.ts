import { SnippetsService } from 'modules/snippets/snippetsService';
import { insert, replaceAt, replaceRange } from 'modules/string/string';
import { isSpace, isTab } from 'resources/keybindings/key-bindings';
import {
  ISnippet,
  USER_SNIPPETS,
} from 'resources/keybindings/snippets/snippets';

import { SPACE } from '../../../resources/keybindings/app-keys';
import { VIM_COMMAND } from '../vim-commands-repository';
import { VimStateClass } from '../vim-state';
import { VimMode } from '../vim-types';
import { AbstractMode } from './abstract-mode';

const TIMER = 500;

export class InsertMode extends AbstractMode {
  currentMode = VimMode.INSERT;
  queuedKeys: string[] = [];

  typingIntervalTimer;

  type(newInput: string): VimStateClass {
    if (isSpace(newInput)) {
      newInput = ' ';
    }

    let currentCursorCol = this.vimState.cursor.col;
    let moveRightBy = newInput.length;
    const activeText = this.vimState.getActiveLine().text;
    let updatedInput = activeText;
    // keep track of input for snippets
    // have a trigger time window, in which snippets can be trigged
    clearInterval(this.typingIntervalTimer);

    if (isTab(newInput)) {
      const { indentSize } = this.vimOptions;
      const snippetBody = [' '.repeat(indentSize)];
      const tabAsSnippet: ISnippet = {
        prefix: 'Tab',
        body: snippetBody,
      };
      newInput = snippetBody[0];
      moveRightBy = snippetBody[0].length;
      this.vimState.commandName = VIM_COMMAND['snippet'];
      this.vimState.snippet = tabAsSnippet;
    } else if (
      this.queuedKeys.length ||
      SnippetsService.containsPrefix(newInput)
    ) {
      this.queuedKeys.push(newInput);
      this.typingIntervalTimer = setTimeout(() => {
        this.clearQueuedKeys();
      }, TIMER);
      // check snippets
      const targetSnippet = USER_SNIPPETS.find((snippet) => {
        const is = snippet.prefix === this.queuedKeys.join('');
        return is;
      });

      if (targetSnippet) {
        // TODO: support the whole body
        newInput = targetSnippet.body[0];

        // remove old chars
        // - 1; we trigger snippets
        // , when the last char was typed, thus the last char does not gets printed anyway
        const replaceStart = currentCursorCol - (this.queuedKeys.length - 1);
        const replaceEnd = currentCursorCol - (this.queuedKeys.length - 2);
        updatedInput = replaceRange(activeText, replaceStart, replaceEnd, '');
        this.clearQueuedKeys();
        const newColBasedOnReplaced =
          currentCursorCol - this.queuedKeys.length - 1; // - 1; go one before because of replacement
        currentCursorCol = newColBasedOnReplaced;
        const bodyLength = newInput.length;
        moveRightBy = bodyLength - 1; // - 1; go one before because of replacement
        this.vimState.commandName = VIM_COMMAND['snippet'];
        this.vimState.snippet = targetSnippet;
      }
    }

    updatedInput = insert(updatedInput, currentCursorCol, newInput);
    this.vimState.updateActiveLine(updatedInput);
    this.vimState.lines[this.vimState.cursor.line].text = updatedInput;
    super.moveRight(moveRightBy);
    // super.cursorRight();
    return this.vimState;
  }

  private clearQueuedKeys() {
    this.queuedKeys = [];
  }

  async executeCommand(
    commandName: VIM_COMMAND,
    commandValue: unknown
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
    return this.vimState;
  }

  tab(): VimStateClass {
    return this.vimState;
  }

  newLine(): VimStateClass {
    return this.vimState;
  }
}
