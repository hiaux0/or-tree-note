import { ModifiersType } from './../../resources/keybindings/app.keys';
import keyBindings from '../../resources/keybindings/key-bindings';

export const VIM_COMMANDS = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
  "type",
  "enterInsertMode",
  "enterNormalMode",
  "enterVisualMode",
  "cursorWordForwardEnd",
  "cursorBackwordsStartWord",
  "delete",
  "backspace",
  "newLine",
  //visual
  "visualInnerWord",
  "visualStartLineWise",
  "visualMoveToOtherEndOfMarkedArea"
] as const;
export type VimCommandNames = typeof VIM_COMMANDS[number];

export interface VimCommand {
  key: string;
  command: VimCommandNames;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
