import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

import './app.scss';

export class App {
  public message: string = 'Hello World!';

  constructor(private router: Router) {}

  attached() {
    const editor = document.getElementById('editor');
    let isComposing = false;

    editor.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    editor.addEventListener('compositionupdate', handleCompositionUpdate);

    editor.addEventListener('compositionend', (event) => {
      isComposing = false;
      handleCompositionUpdate(event);
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: app.ts ~ line 26 ~ compositionend');
    });

    editor.addEventListener('input', handleInput);

    function handleCompositionUpdate(event) {
      if (isComposing) {
        console.log('handleCompositionUpdate');
        const text = event.target.innerText;
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: app.ts ~ line 32 ~ text', text);
        // Process the composition text here
        // You can update your editor's content or perform any necessary transformations
      }
    }

    function handleInput(event) {
      if (!isComposing) {
        console.log('handleInput');
        const text = event.target.innerText;
        /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: app.ts ~ line 39 ~ text', text);
        // Process the entered text here
        // You can update your editor's content or perform any necessary transformations
      }
    }
  }

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
