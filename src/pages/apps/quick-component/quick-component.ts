import { SelectionService } from 'modules/SelectionService';
import rangy from 'rangy';

export class QuickComponent {
  containerRef: HTMLDivElement;

  attached() {
    setTimeout(() => {
      this.toggleMode();
    }, 0);
  }

  toggleMode() {
    const isInsertMode =
      this.containerRef.getAttribute('contenteditable') === 'true';

    const $childs = this.containerRef.querySelectorAll('div');
    const targetNode = $childs[0].childNodes[0];
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: quick-component.ts ~ line 18 ~ targetNode', targetNode)

    if (isInsertMode) {
      const range = SelectionService.createRange(targetNode, {
        line: 0,
        col: 0,
      });

      // Save selection before switching to Normal mode
      // const range = rangy.getSelection().getRangeAt(0);
      this.containerRef.toggleAttribute('contenteditable', false);

      // Restore selection in Insert mode
      setTimeout(() => {
        this.containerRef.toggleAttribute('contenteditable', true);
        this.containerRef.focus();
        rangy.getSelection().setSingleRange(range);
      });
    } else {
      this.containerRef.toggleAttribute('contenteditable', true);
      this.containerRef.focus();
    }
  }
}
