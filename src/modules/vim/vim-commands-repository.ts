import { ModifiersType } from '../../resources/keybindings/app.keys';

export const VIM_COMMANDS = [
  'cursorRight',
  'cursorUp',
  'cursorLeft',
  'cursorDown',
  'yank',
  'type',
  'enterInsertMode',
  'enterNormalMode',
  'enterVisualMode',
  'cursorWordForwardEnd',
  'cursorBackwordsStartWord',
  'cursorLineEnd',
  'cursorLineStart',
  'delete',
  'deleteInnerWord',
  'backspace',
  'newLine',
  // visual
  'visualDelete',
  'visualInnerWord',
  'visualStartLineWise',
  'visualMoveToOtherEndOfMarkedArea',
] as const;
export type VimCommandNames = typeof VIM_COMMANDS[number];

export const VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE = ['visualDelete'];

export interface VimCommand {
  key: string;
  command: VimCommandNames;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
