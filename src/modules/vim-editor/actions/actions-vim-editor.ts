import { StateHistory, nextStateHistory } from "aurelia-store";
import produce from "immer";
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
