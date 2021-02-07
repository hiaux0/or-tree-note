import { bindable } from 'aurelia-framework';
import {
  CURRENT_OTN_MODE,
  OTN_STATE_KEY,
  OTN_STATE_REAL_USAGE_KEY,
} from 'local-storage';
import { initialVimEditorState } from 'store/initial-state';
import './apps.scss';

export class Apps {
  @bindable value = 'Apps';

  currentMode = window.localStorage.getItem(CURRENT_OTN_MODE);

  realUsage() {
    window.localStorage.setItem(CURRENT_OTN_MODE, OTN_STATE_REAL_USAGE_KEY);
    window.location.reload();
  }

  resetStore() {
    window.localStorage.setItem(CURRENT_OTN_MODE, OTN_STATE_KEY);

    window.localStorage.setItem(
      OTN_STATE_KEY,
      JSON.stringify(initialVimEditorState)
    );
    window.location.reload();
  }
}
