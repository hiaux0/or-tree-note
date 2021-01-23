import { AbstractTextMode } from "../abstract-text-mode";

export class NormalTextMode extends AbstractTextMode {
  constructor(public parentElement, public childSelector, public caretElement) {
    super(parentElement, childSelector, caretElement);
  }
}
