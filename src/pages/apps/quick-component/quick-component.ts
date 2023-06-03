export class QuickComponent {
  private readonly textResult = '';
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

    console.log('Text content: ', lineRef.innerText);

    lineRef.addEventListener('compositionstart', () => {
      this.textResult_compositionstart = this.lineRef.textContent;
    });
    lineRef.addEventListener('compositionupdate', () => {
      this.textResult_compositionupdate = this.lineRef.textContent;
    });
    lineRef.addEventListener('compositionend', () => {
      this.textResult_compositionend = this.lineRef.textContent;
    });
    lineRef.addEventListener('keydown', () => {
      this.textResult_keydown = this.lineRef.textContent;
    });
    lineRef.addEventListener('keyup', () => {
      this.textResult_keyup = this.lineRef.textContent;
    });
    lineRef.addEventListener('keypress', () => {
      this.textResult_keypress = this.lineRef.textContent;
    });
    lineRef.addEventListener('input', (event: InputEvent) => {
      /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: quick-component.ts ~ line 36 ~ event', event.data);
      this.textResult_input = this.lineRef.textContent;
    });
  }
}
