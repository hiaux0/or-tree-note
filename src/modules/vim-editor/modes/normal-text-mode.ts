import { StateHistory, Store } from "aurelia-store";
import { Logger } from "modules/debug/logger";
import { VimState } from "modules/vim/vim.types";
import { VimEditorState } from "store/initial-state";
import { AbstractTextMode } from "./abstract-text-mode";
import { changeText, createNewLine } from "../actions/actions-vim-editor";

const logger = new Logger({ scope: "NormalTextMode" });

export class NormalTextMode extends AbstractTextMode {
  constructor(
    public parentElement,
    public childSelector,
    public caretElement,
    public store: Store<StateHistory<VimEditorState>>
  ) {
    super(parentElement, childSelector, caretElement, store);

    this.store.registerAction("createNewLine", createNewLine);
  }

  newLine(vimState: VimState) {
    const newLineIndex = vimState.cursor.line;
    super.setCursorMovement(vimState.cursor);
    this.store.dispatch(createNewLine, newLineIndex, vimState.text);
  }

  indentRight(vimState: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.setCursorMovement(vimState.cursor);
  }

  indentLeft(vimState: VimState) {
    this.store.dispatch(changeText, vimState.cursor.line, vimState.text);
    super.setCursorMovement(vimState.cursor);
  }
}
