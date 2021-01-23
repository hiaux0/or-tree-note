import { AbstractTextMode } from "../abstract-text-mode";

export class NormalTextMode extends AbstractTextMode {
  constructor(
    public parentElement,
    public childSelector,
    public caretElement,
    public store
  ) {
    super(parentElement, childSelector, caretElement, store);
  }
}
