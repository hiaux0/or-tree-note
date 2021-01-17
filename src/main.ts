import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
import { initialVimEditorState } from "store/initial-state";

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"));

  aurelia.use.developmentLogging(environment.debug ? "debug" : "warn");
  aurelia.use.plugin(PLATFORM.moduleName("aurelia-store"), {
    initialState: initialVimEditorState,
  });

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName("app")));
}
