import { PLATFORM } from 'aurelia-pal';
import { Router } from 'aurelia-router';

import './app.scss';

export class App {
  public message: string = 'Hello World!';

  constructor(private router: Router) {}

  attached() {
    // this.initMouseCoords();
  }

  /**
   * @param {object} router - https://aurelia.io/docs/api/router/class/Router
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
        route: 'apps/*viewModelName',
        moduleId: PLATFORM.moduleName('./pages/apps/apps-welcome/apps-welcome'),
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

  private initMouseCoords() {
    const mouseCoordinates = document.getElementById('mouse-coordinates');

    document.addEventListener('mousemove', (event) => {
      const x = event.clientX;
      const y = event.clientY;

      mouseCoordinates.textContent = `X: ${x} / Y: ${y}`;
      mouseCoordinates.style.left = `${x + 15}px`;
      mouseCoordinates.style.top = `${y + 15}px`;
    });
  }
}
