import { StateHistory, nextStateHistory } from "aurelia-store";
import produce from "immer";
import { Cursor } from "modules/vim/vim.types";
import { VimEditorState } from "store/initial-state";

export const changeText = (
  state: StateHistory<VimEditorState>,
  targetLineNumber: number,
  newText: string
) => {
  return nextStateHistory(
    state,
    produce(state.present, (draftState) => {
      const targetDraftLine = draftState.lines[targetLineNumber];

      targetDraftLine.text = newText;
    })
  );
};

export function createNewLine(
  state: StateHistory<VimEditorState>,
  newLineIndex: number,
  newText: string
) {
  return nextStateHistory(
    state,
    produce(state.present, (draftState) => {
      draftState.lines.splice(newLineIndex, 0, {
        text: newText,
      });
    })
  );
}

/** ********/
/** Cursor */
/** ********/

export function changeCursorPosition(
  state: StateHistory<VimEditorState>,
  newCursorPosition: Cursor
) {
  return nextStateHistory(
    state,
    produce(state.present, (draftState) => {
      draftState.cursorPosition = newCursorPosition;
    })
  );
}
