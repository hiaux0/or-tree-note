import { StateHistory, nextStateHistory } from 'aurelia-store';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import { VimStateClass } from 'modules/vim/vim-state';
import { EditorIds, EditorLine, VimEditorState } from 'store/initial-state';

export function changeVimState(
  state: StateHistory<VimEditorState>,
  editorId: number,
  newVimState: VimStateClass
) {
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

export const changeManyText = (
  state: StateHistory<VimEditorState>,
  editorId: number,
  newLines: EditorLine[]
) => {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].lines = newLines;
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

export function changeActiveEditors(
  state: StateHistory<VimEditorState>,
  editorIds: EditorIds
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.activeEditorIds = editorIds;
    })
  );
}

export function toggleActiveEditors(
  state: StateHistory<VimEditorState>,
  editorId: number
) {
  const asSet = new Set(state.present.activeEditorIds);

  if (asSet.has(editorId)) {
    asSet.delete(editorId);
  } else {
    asSet.add(editorId);
  }

  const updatedIds = Array.from(asSet);
  return changeActiveEditors(state, updatedIds);
}
