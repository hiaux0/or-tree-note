import { bindable } from 'aurelia-framework';
import highlightJs from 'highlight.js';

export class HighlightCode {
  @bindable code: string;
  @bindable language = 'Markdown';
  private readonly highlightRef: HTMLElement;

  attached() {
    const result = highlightJs.highlight(this.code, {language: 'md'});
    const html = result.value;
    this.highlightRef.innerHTML = html;
  }
}
