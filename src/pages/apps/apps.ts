import { bindable, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import {
  CURRENT_OTN_MODE,
  OTN_STATE_KEY,
  OTN_STATE_REAL_USAGE_KEY,
} from 'local-storage';
import { initialVimEditorState } from 'store/initial-state';
import './apps.scss';

export class Apps {
  @bindable value = 'Apps';

  constructor(private router: Router) {}

  currentMode = window.localStorage.getItem(CURRENT_OTN_MODE);
  private readonly viewModelName: string;
  private readonly viewModel: string;

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

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      {
        name: 'appsWelcome',
        route: '',
        moduleId: PLATFORM.moduleName('./apps-welcome/apps-welcome'),
        nav: true,
      },
    ]);
    this.router = router;
  }
}
