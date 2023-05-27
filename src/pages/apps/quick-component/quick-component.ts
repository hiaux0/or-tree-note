export class QuickComponent {
  private readonly textResult = '';
  private readonly lineRef: HTMLDivElement;

  attached() {
    const lineRef = this.lineRef;
    let sequenceBuffer: string[] = [];

    const replacementMapping = {
      ',a': '() => {}',
      ',.r': 'return',
      // Add any other mappings here
    };

    lineRef.addEventListener('keydown', (e) => {
      sequenceBuffer.push(e.key);
      const sequence = sequenceBuffer.join('');
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: quick-component.ts ~ line 18 ~ sequence', sequence)
      if (sequence in replacementMapping) {
        e.preventDefault();
        replaceSequenceWith(replacementMapping[sequence]);
      } else if (e.key === 's') {
        e.preventDefault();
        insertTextAtCursor('⭐️');
      }
    });

    lineRef.addEventListener('keyup', () => {
      const sequence = sequenceBuffer.join('');
      const keys = Object.keys(replacementMapping);
      const included = keys.find((key) => key.startsWith(sequence));
      if (!included) {
        sequenceBuffer = [];
      }
    });

    function insertTextAtCursor(text: string) {
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    function replaceSequenceWith(text: string) {
      const sequenceLength = sequenceBuffer.join('').length;
      sequenceBuffer = [];
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const range = sel.getRangeAt(0);
        range.setStart(
          range.startContainer,
          Math.max(range.startOffset - sequenceLength, 0)
        );
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}
