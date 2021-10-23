import { ModifiersType } from '../../resources/keybindings/app.keys';

export const VIM_COMMANDS = [
  'backspace',
  'cursorRight',
  'cursorUp',
  'cursorLeft',
  'cursorDown',
  'cursorWordForwardEnd',
  'cursorWordForwardStart',
  'cursorBackwordsStartWord',
  'cursorLineEnd',
  'cursorLineStart',
  'delete',
  'deleteInnerWord',
  'enterInsertMode',
  'enterNormalMode',
  'enterVisualMode',
  'indentRight',
  'indentLeft',
  'newLine',
  'replace',
  'toCharacterAtBack',
  'toCharacterAt',
  'toCharacterAfterBack',
  'toCharacterBefore',
  'type',
  'yank',
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
