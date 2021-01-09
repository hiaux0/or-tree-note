import { inject, Container } from "aurelia-dependency-injection";
import "aurelia-polyfills";
import { Vim } from "modules/vim/vim";
import { VimEditor, VimEditorOptions } from "./vim-editor";
import hotkeys from "hotkeys-js";

export class VimEditorTextMode {
  childrenElementList: NodeListOf<HTMLElement>;
  elementText: string[] = [];
  vim: Vim;

  constructor(public vimEditorOptions: VimEditorOptions) {}

  setupElementMode() {
    this.childrenElementList = this.vimEditorOptions.parentHtmlElement.querySelectorAll<HTMLElement>(
      `.${this.vimEditorOptions.childSelectors[0]}`
    );

    this.childrenElementList.forEach((childElement) => {
      this.elementText.push(childElement.textContent);
    });
  }

  initVim() {
    this.vim = new Vim(this.elementText);
  }

  initKeys() {
    hotkeys("*", (ev) => {
      console.clear();
      const result = this.vim.queueInput(ev.key);
      console.log("TCL: VimEditorTextMode -> initKeys -> result", result);
    });
  }

  getVim() {
    return this.vim;
  }
}
