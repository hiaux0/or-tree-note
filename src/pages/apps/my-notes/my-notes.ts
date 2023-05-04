import { autoinject } from 'aurelia-framework';
import { connectTo, StateHistory, Store } from 'aurelia-store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { IVimEditor, VimEditorState } from 'store/initial-state';

@autoinject()
@connectTo<StateHistory<VimEditorState>>({
  selector: {
    editors: (store) =>
      store.state.pipe(
        map((x) => x.present.editors),
        distinctUntilChanged()
      ),
  },
})
export class MyNotes {
  private readonly editors: VimEditorState['editors'];
  private readonly editor: IVimEditor;
  numOfEditors: number;

  /**
   * History: Use length of editors to display editors in the view
   *   Before, I repeated over `editor of editors`, but that had a mutability problem,
   *   where changing the state, would trigger re-rendering of or-tree-notes.
   *     This could be an architecture issue, but I opted for the editors.length appraoch
   *     just to make the code work
   */
  bind() {
    this.numOfEditors = this.editors.length;
  }
}
