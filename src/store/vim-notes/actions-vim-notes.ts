import { nextStateHistory, StateHistory } from 'aurelia-store';
import produce from 'immer';
import { VimEditorState } from 'store/initial-state';

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
  editorId: number,
  targetLineNumber: number
) => {
  return nextStateHistory(
    state,
    produce(state.present, (draftState) => {
      const index =
        draftState.editors[editorId].vimState.lines[targetLineNumber].id;
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: actions-vim-notes.ts ~ line 25 ~ index', index);
      const targetDraftLine = draftState.editors[editorId].linesAddons[index];
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: actions-vim-notes.ts ~ line 28 ~ targetDraftLine', targetDraftLine);

      //
      if (targetDraftLine.macro) {
        targetDraftLine.macro.checkbox.value =
          !targetDraftLine.macro.checkbox.value;
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
