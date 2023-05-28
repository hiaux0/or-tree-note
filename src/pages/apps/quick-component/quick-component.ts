export class QuickComponent {
  private textResult = '';
  private textResult_compositionstart = '';
  private textResult_compositionend = '';
  private textResult_keydown = '';
  private textResult_keyup = '';
  private textResult_keypress = '';
  private textResult_input = '';
  textResult_compositionupdate: string;
  private readonly lineRef: HTMLDivElement;

  attached() {
    const lineRef = this.lineRef;
    let sequenceBuffer: string[] = [];
    let isComposing = false;

    console.log('Text content: ', lineRef.innerText);

    lineRef.addEventListener('compositionstart', (e) => {
      isComposing = true;
      this.textResult_compositionstart = this.lineRef.textContent;
    });
    lineRef.addEventListener('compositionupdate', (e) => {
      this.textResult_compositionupdate = this.lineRef.textContent;
    });
    lineRef.addEventListener('compositionend', (e) => {
      isComposing = false;
      this.textResult_compositionend = this.lineRef.textContent;
    });
    lineRef.addEventListener('keydown', (e) => {
      this.textResult_keydown = this.lineRef.textContent;
    });
    lineRef.addEventListener('keyup', () => {
      this.textResult_keyup = this.lineRef.textContent;
    });
    lineRef.addEventListener('keypress', () => {
      this.textResult_keypress = this.lineRef.textContent;
    });
    lineRef.addEventListener('input', (event: InputEvent) => {
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: quick-component.ts ~ line 36 ~ event', event.data)
      this.textResult_input = this.lineRef.textContent;
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
