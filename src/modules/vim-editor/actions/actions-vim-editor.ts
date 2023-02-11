import { StateHistory, nextStateHistory } from 'aurelia-store';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimEditorState } from 'store/initial-state';

export function changeVimState(
  state: StateHistory<VimEditorState>,
  newVimState: VimStateClass
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.vimState = newVimState.serialize();
      draftState.lines;
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: actions-vim-editor.ts ~ line 16 ~ draftState.vimState.lines', draftState.vimState.lines);
    })
  );
}

export const changeText = (
  state: StateHistory<VimEditorState>,
  targetLineNumber: number,
  newText: string
) => {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      const targetDraftLine = draftState.lines[targetLineNumber];

      targetDraftLine.text = newText;
    })
  );
};

export function createNewLine(
  state: StateHistory<VimEditorState>,
  newLineIndex: number,
  previousText: string,
  newText: string
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.lines[newLineIndex - 1].text = previousText;
      draftState.lines.splice(newLineIndex, 0, {
        text: newText,
      });
    })
  );
}
