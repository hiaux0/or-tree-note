import { bindable, PLATFORM } from 'aurelia-framework';
import { Router, RouterEvent } from 'aurelia-router';

import './uilib.scss';

export class Uilib {
  @bindable value = 'Uilib';

  constructor(private router: Router) {}

  configureRouter(config, router) {
    config.map([
      {
        name: 'uilibWelcome',
        route: '',
        moduleId: PLATFORM.moduleName('./uilib-welcome/uilib-welcome'),
        nav: true,
      },
    ]);
    this.router = router;
  }
}
