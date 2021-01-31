import { PLATFORM } from 'aurelia-pal';
import { Router, RouterEvent } from 'aurelia-router';

import './app.scss';

export class App {
  public message: string = 'Hello World!';

  constructor(private router: Router) {}

  /**
   * @param {object} router https://aurelia.io/docs/api/router/class/Router
   */
  configureRouter(config, router) {
    config.map([
      {
        name: 'home',
        route: '',
        moduleId: PLATFORM.moduleName('./pages/home/home'),
      },
      {
        route: 'apps',
        moduleId: PLATFORM.moduleName('./pages/apps/apps'),
        nav: true,
        title: 'Apps',
      },
      {
        route: 'uilib',
        moduleId: PLATFORM.moduleName('./pages/uilib/uilib'),
        nav: true,
        title: 'uilib',
      },
      {
        route: 'uilib/*viewModelName',
        moduleId: PLATFORM.moduleName(
          './pages/uilib/uilib-welcome/uilib-welcome'
        ),
      },
    ]);
    this.router = router;
  }
}
