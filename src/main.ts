import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
import { initialVimEditorState } from "store/initial-state";
import { setAutoFreeze } from "immer";
import { OTN_STATE } from "local-storage";

// This is required to allow Aurelia to add its observer on objects in the state.
setAutoFreeze(false);

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"));

  const localStorageState = JSON.parse(window.localStorage.getItem(OTN_STATE));

  aurelia.use.developmentLogging(environment.debug ? "debug" : "warn");
  aurelia.use.plugin(PLATFORM.moduleName("aurelia-store"), {
    initialState: localStorageState || initialVimEditorState,
    history: {
      undoable: true,
    },
  });

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
