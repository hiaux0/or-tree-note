import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { setAutoFreeze } from 'immer';
import { CURRENT_OTN_MODE } from 'local-storage';
import { initialVimEditorState, VimEditorState } from 'store/initial-state';

import * as environment from '../config/environment.json';

// This is required to allow Aurelia to add its observer on objects in the state.
setAutoFreeze(false);

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  const currentMode = window.localStorage.getItem(CURRENT_OTN_MODE);
  const localStorageState = JSON.parse(
    window.localStorage.getItem(currentMode)
  ) as VimEditorState;

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');
  // const initialState = localStorageState || initialVimEditorState;
  const initialState = initialVimEditorState;
  /** https://aurelia.io/docs/plugins/store#introduction */
  aurelia.use.plugin(PLATFORM.moduleName('aurelia-store'), {
    initialState,
    history: {
      undoable: true,
      limit: 5,
    },
  });

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  void aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
