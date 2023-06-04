import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

import './app.scss';

export class App {
  public message: string = 'Hello World!';

  constructor(private router: Router) {}

  bind() {
    document.addEventListener('mousedown', (ev: MouseEvent) => {
      if (ev.buttons === 4) {
        console.clear();
      }
    });
    document.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'q') {
        setTimeout(() => {
          console.clear();
        }, 0);
      }
    });
  }

  attached() {}

  configureRouter(config: RouterConfiguration, router: Router) {
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
