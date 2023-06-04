import { StateHistory, nextStateHistory } from 'aurelia-store';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import { VimStateClass } from 'modules/vim/vim-state';
import { VimLine } from 'modules/vim/vim-types';
import { EditorId, EditorIds, VimEditorState } from 'store/initial-state';

export function changeVimState(
  state: StateHistory<VimEditorState>,
  editorId: EditorId,
  newVimState: VimStateClass
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].vimState = newVimState.serialize();
      draftState.editors[editorId].vimState.deletedLinesIndeces?.forEach(
        (deletedLineIndex) => {
          const lineThatWillDeleted =
            draftState.editors[editorId].vimState.lines[deletedLineIndex];
          const indexOfLineThatWillDeleted = lineThatWillDeleted.id;
          draftState.editors[editorId].vimState.lines.splice(
            deletedLineIndex,
            1
          );
          draftState.editors[editorId].linesAddons[indexOfLineThatWillDeleted] =
            null;
        }
      );
    })
  );
}

export const changeText = (
  state: StateHistory<VimEditorState>,
  editorId: EditorId,
  targetLineNumber: number,
  newText: string
) => {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      const targetDraftLine =
        draftState.editors[editorId].vimState.lines[targetLineNumber];

      targetDraftLine.text = newText;
    })
  );
};

export const changeManyText = (
  state: StateHistory<VimEditorState>,
  editorId: EditorId,
  newLines: VimLine[]
) => {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].vimState.lines = newLines;
    })
  );
};

export function createNewLine(
  state: StateHistory<VimEditorState>,
  editorId: EditorId,
  newLineIndex: number,
  previousText: string,
  newText: string
) {
  return nextStateHistory(
    cloneDeep(state),
    produce(state.present, (draftState) => {
      draftState.editors[editorId].vimState.lines[newLineIndex - 1].text =
        previousText;
      draftState.editors[editorId].vimState.lines.splice(newLineIndex, 0, {
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
  editorId: EditorId
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
