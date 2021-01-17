// @ts-check
import produce from "immer";
import { VimEditorState } from "store/initial-state";

/** @typedef {Wellplate.CompositeToolbar['legend']} CompositeToolbarLegend */

/**
 * @param {Wellplate.State} state
 * @param {Wellplate.ChangeLayerParams} changeLayerParams
 * @returns {Wellplate.State} newState
 */
export function changeText(state: VimEditorState, newText: string) {
  return produce(state, (draftState) => {
    draftState.lines[0].text = "AURELIA STORE CHANGED";
    draftState.lines[1].text = newText;
  });
}
