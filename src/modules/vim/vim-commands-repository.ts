import { ModifiersType, SPACE } from '../../resources/keybindings/app-keys';

export enum VIM_COMMAND {
  'backspace' = 'backspace',
  'clearLine' = 'clearLine',
  'createNewLine' = 'createNewLine',
  'cursorRight' = 'cursorRight',
  'cursorUp' = 'cursorUp',
  'cursorLeft' = 'cursorLeft',
  'cursorDown' = 'cursorDown',
  'cursorWordForwardEnd' = 'cursorWordForwardEnd',
  'cursorWordForwardStart' = 'cursorWordForwardStart',
  'cursorBackwordsStartWord' = 'cursorBackwordsStartWord',
  'cursorLineEnd' = 'cursorLineEnd',
  'cursorLineStart' = 'cursorLineStart',
  'delete' = 'delete',
  'deleteInnerWord' = 'deleteInnerWord',
  'deleteLine' = 'deleteLine',
  'enterInsertMode' = 'enterInsertMode',
  'enterNormalMode' = 'enterNormalMode',
  'enterVisualMode' = 'enterVisualMode',
  'indentRight' = 'indentRight',
  'indentLeft' = 'indentLeft',
  'joinLine' = 'joinLine',
  'newLine' = 'newLine',
  'replace' = 'replace',
  'space' = 'space',
  'toCharacterAtBack' = 'toCharacterAtBack',
  'toCharacterAt' = 'toCharacterAt',
  'toCharacterAfterBack' = 'toCharacterAfterBack',
  'toCharacterBefore' = 'toCharacterBefore',
  'type' = 'type',
  'yank' = 'yank',
  'visualDelete' = 'visualDelete',
  'visualInnerWord' = 'visualInnerWord',
  'visualStartLineWise' = 'visualStartLineWise',
  'visualMoveToOtherEndOfMarkedArea' = 'visualMoveToOtherEndOfMarkedArea',
}

export const VIM_MODE_COMMANDS = [
  VIM_COMMAND['enterInsertMode'],
  VIM_COMMAND['enterNormalMode'],
  VIM_COMMAND['enterVisualMode'],
];

export const VIM_COMMANDS = [
  VIM_COMMAND.newLine,
  VIM_COMMAND['backspace'],
  VIM_COMMAND['createNewLine'],
  VIM_COMMAND['cursorRight'],
  VIM_COMMAND['cursorUp'],
  VIM_COMMAND['cursorLeft'],
  VIM_COMMAND['cursorDown'],
  VIM_COMMAND['cursorWordForwardEnd'],
  VIM_COMMAND['cursorWordForwardStart'],
  VIM_COMMAND['cursorBackwordsStartWord'],
  VIM_COMMAND['cursorLineEnd'],
  VIM_COMMAND['cursorLineStart'],
  VIM_COMMAND['delete'],
  VIM_COMMAND['deleteLine'],
  VIM_COMMAND['deleteInnerWord'],

  VIM_COMMAND['indentRight'],
  VIM_COMMAND['indentLeft'],
  VIM_COMMAND['joinLine'],
  VIM_COMMAND['newLine'],
  VIM_COMMAND['replace'],
  VIM_COMMAND['space'],
  VIM_COMMAND['toCharacterAtBack'],
  VIM_COMMAND['toCharacterAt'],
  VIM_COMMAND['toCharacterAfterBack'],
  VIM_COMMAND['toCharacterBefore'],
  VIM_COMMAND['type'],
  VIM_COMMAND['yank'],
  // visual
  VIM_COMMAND['visualDelete'],
  VIM_COMMAND['visualInnerWord'],
  VIM_COMMAND['visualStartLineWise'],
  VIM_COMMAND['visualMoveToOtherEndOfMarkedArea'],
  // ...VIM_MODE_COMMANDS,
  VIM_COMMAND['enterInsertMode'],
  VIM_COMMAND['enterNormalMode'],
  VIM_COMMAND['enterVisualMode'],
];
export type VimCommandNames = keyof typeof VIM_COMMAND;

export const VIM_COMMANDS_THAT_CHANGE_TO_NORMAL_MODE = ['visualDelete'];

export interface VimCommand {
  key: string;
  command: VimCommandNames;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
