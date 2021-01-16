import { ModifiersType } from "./../../resources/keybindings/app.keys";
export const VIM_COMMANDS = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
  "type",
  "enterInsertTextMode",
  "enterNormalTextMode",
  "cursorWordForwardEnd",
] as const;

export type VimCommandNames = typeof VIM_COMMANDS[number];

export interface VimCommand {
  key: string;
  command: VimCommandNames;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
