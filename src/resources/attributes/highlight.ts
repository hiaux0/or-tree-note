import highlightJs from 'highlight.js';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/monokai.css';
// import 'highlight.js/styles/nord.css';
// import 'highlight.js/styles/default.css';

export class HighlightCustomAttribute {
  static inject = [Element];

  constructor(private readonly element: HTMLElement) {}

  attached() {
    const raw = highlightJs.highlight(this.element.textContent, {
      language: 'md',
    });
    const result = raw.value;
    const classes = getClasses(result)?.split(' ');

    if (!classes) return;

    this.element.classList.add(...classes);
  }
}

function getClasses(input: string): string | null {
  const regex = /class="(.*)"/;
  const execed = regex.exec(input);
  if (execed === null) return;

  const result = execed[1];
  return result;
}
