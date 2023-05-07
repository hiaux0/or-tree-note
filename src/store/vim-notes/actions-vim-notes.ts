import { nextStateHistory, StateHistory } from 'aurelia-store';
import produce from 'immer';
import { VimEditorState } from 'store/initial-state';

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
  targetLineNumber: number
) => {
  return nextStateHistory(
    state,
    produce(state.present, (draftState) => {
      const targetDraftLine = draftState.lines[targetLineNumber];

      //
      if (targetDraftLine.macro) {
        targetDraftLine.macro.checkbox.value = !targetDraftLine.macro.checkbox
          .value;
        //
      } else {
        targetDraftLine.macro = {
          checkbox: {
            value: true,
          },
        };
      }
    })
  );
};
