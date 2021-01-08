import { bindable } from "aurelia-framework";
import "./or-tree-notes.scss";

export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  editorLineClass: string = "editor-line";

  bind() {}

  attached() {}
}
