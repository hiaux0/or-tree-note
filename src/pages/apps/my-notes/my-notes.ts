import { autoinject } from 'aurelia-framework';
import { connectTo, StateHistory, Store } from 'aurelia-store';
import { findParentElement } from 'modules/dom/dom';
import { toggleActiveEditors } from 'modules/vim-editor/actions/actions-vim-editor';
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

  constructor(private readonly store: Store<StateHistory<VimEditorState>>) {
    this.store.registerAction('toggleActiveEditors', toggleActiveEditors);
  }

  /**
   * History: Use length of editors to display editors in the view
   *   Before, I repeated over `editor of editors`, but that had a mutability problem,
   *   where changing the state, would trigger re-rendering of vim-notes.
   *     This could be an architecture issue, but I opted for the editors.length appraoch
   *     just to make the code work
   */
  bind() {
    this.numOfEditors = this.editors.length;
  }

  attached() {
    this.addEventListeners();
  }

  private addEventListeners() {
    // this.toggleActiveEditors();
  }

  private toggleActiveEditors() {
    document.addEventListener('click', (event: MouseEvent) => {
      const closestParent = findParentElement(
        event.target as HTMLElement,
        '.otn-container'
      );

      if (closestParent !== null) {
        void this.store.dispatch(
          'toggleActiveEditors',
          Number(closestParent.dataset?.otnId)
        );
      }
    });
  }
}
