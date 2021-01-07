import { bindable } from "aurelia-framework";
import { EditingModes, EditorModes } from "modules/editing-modes/editing-modes";
import "./or-tree-notes.scss";

export class OrTreeNotes {
  @bindable value = "OrTreeNotes";

  notesContainerRef: HTMLDivElement;
  lineSpanRef: HTMLSpanElement;
  caretRef: HTMLSpanElement;

  currentModeName: EditorModes;

  editorLineClass: string = "editor-line";

  bind() {}

  attached() {
    const editModes = new EditingModes(
      this.notesContainerRef,
      `.${this.editorLineClass}`,
      this.caretRef
    );
    editModes.init();
    this.currentModeName = editModes.currentModeName;
  }
}
