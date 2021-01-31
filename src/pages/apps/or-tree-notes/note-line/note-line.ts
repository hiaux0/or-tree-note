import { EditorLine } from 'store/initial-state';
import { bindable } from 'aurelia-framework';
import './note-line.scss';

export class NoteLine {
  @bindable value = 'NoteLine';

  @bindable line: EditorLine;

  @bindable editorLineClass: string;

  isDefaultLine(line: EditorLine) {
    const isDefault = line.macro?.checkbox === undefined;
    return isDefault;
  }
}
