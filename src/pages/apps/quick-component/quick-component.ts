import { bindable } from 'aurelia-framework';
import rangy from 'rangy';

export class QuickComponent {
  toggleMode() {
    const $container = document.querySelector<HTMLElement>('.container');
    const isInsertMode = $container.getAttribute('contenteditable') === 'true';

    if (isInsertMode) {
      // Save selection before switching to Normal mode
      const range = rangy.getSelection().getRangeAt(0);
      $container.toggleAttribute('contenteditable', false);

      // Restore selection in Insert mode
      setTimeout(() => {
        $container.toggleAttribute('contenteditable', true);
        $container.focus();
        rangy.getSelection().setSingleRange(range);
      });
    } else {
      $container.toggleAttribute('contenteditable', true);
      $container.focus();
    }
  }
}
