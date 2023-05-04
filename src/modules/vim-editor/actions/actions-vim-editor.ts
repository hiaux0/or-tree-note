import { StateHistory, nextStateHistory } from 'aurelia-store';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimEditorState } from 'store/initial-state';

export function changeVimState(
  state: StateHistory<VimEditorState>,
  editorId: number,
  newVimState: VimStateClass
) {
  // /* prettier-ignore */ console.trace('>>>> _ >>>> ~ file: actions-vim-editor.ts ~ line 8 ~ changeVimState', changeVimState);

  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].vimState = newVimState.serialize();
      draftState.editors[editorId].vimState.deletedLinesIndeces?.forEach(
        (deletedLineIndex) => {
          draftState.editors[editorId].vimState.lines.splice(
            deletedLineIndex,
            1
          );
          draftState.editors[editorId].lines.splice(deletedLineIndex, 1);
        }
      );
    })
  );
}

export const changeText = (
  state: StateHistory<VimEditorState>,
  editorId: number,
  targetLineNumber: number,
  newText: string
) => {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      const targetDraftLine =
        draftState.editors[editorId].lines[targetLineNumber];

      targetDraftLine.text = newText;
    })
  );
};

export function createNewLine(
  state: StateHistory<VimEditorState>,
  editorId: number,
  newLineIndex: number,
  previousText: string,
  newText: string
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].lines[newLineIndex - 1].text = previousText;
      draftState.editors[editorId].lines.splice(newLineIndex, 0, {
        text: newText,
      });
    })
  );
}
