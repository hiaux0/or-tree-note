import produce from "immer";
import { VimEditorState } from "store/initial-state";
import { nextStateHistory, StateHistory } from "aurelia-store";

/** @typedef {Wellplate.CompositeToolbar['legend']} CompositeToolbarLegend */

// /**
//  */
// export function toggleCheckbox(state: VimEditorState, newText: string) {
//   return produce(state, (draftState) => {
//     draftState.lines[0].text = "AURELIA STORE CHANGED";
//     draftState.lines[1].text = newText;
//   });
// }

export const toggleCheckbox = (
  state: StateHistory<VimEditorState>,
  newText: string
) => {
  return nextStateHistory(state, {
    lines: [{ text: "hsitory" }, { text: newText }],
  });
};
