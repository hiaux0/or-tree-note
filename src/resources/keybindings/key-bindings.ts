// Naming based on https://vim.rtorr.com/

import { VimCommand, VIM_COMMAND } from 'modules/vim/vim-commands-repository';

import {
  ALT,
  BACKSPACE,
  CONTROL,
  DELETE,
  ESCAPE,
  SHIFT,
  SPACE,
} from './app-keys';

export const Modifier = {
  '<Alt>': '<Alt>',
  '<Backspace>': '<Backspace>',
  '<Control>': '<Control>',
  '<Delete>': '<Delete>',
  '<Escape>': '<Escape>',
  '<Meta>': '<Meta>',
  '<Shift>': '<Shift>',
  '<Space>': '<Space>',
};

const commandsAllModes = [{ key: '<Escape>', command: 'enterNormalMode' }];
/**
 * The very next input
 * TODO: rename? `...VeryNextInput`
 */
export const commandsThatWaitForNextInput: VimCommand[] = [
  { key: 'F', command: VIM_COMMAND['toCharacterAtBack'] },
  { key: 'f', command: VIM_COMMAND['toCharacterAt'] },
  { key: 'r', command: VIM_COMMAND['replace'] },
  { key: 'T', command: VIM_COMMAND['toCharacterAfterBack'] },
  { key: 't', command: VIM_COMMAND['toCharacterBefore'] },
  // { key: `${Modifier['<Space>']}tc`, command: VIM_COMMAND.space },
];

const cursorAllModes = [
  { key: '<ArrowLeft>', command: 'cursorLeft' },
  { key: '<ArrowUp>', command: 'cursorUp' },
  { key: '<ArrowRight>', command: 'cursorRight' },
  { key: '<ArrowDown>', command: 'cursorDown' },
];

const cursorNormalAndVisual = [
  { key: 'b', command: 'cursorBackwordsStartWord' }, // jump backwards to the start of a word
  { key: 'e', command: 'cursorWordForwardEnd' },
  { key: 'h', command: 'cursorLeft' },
  { key: 'k', command: 'cursorUp' },
  { key: 'l', command: 'cursorRight' },
  { key: 'u', command: 'cursorDown' },
  { key: 'w', command: 'cursorWordForwardStart' },
  { key: '$', command: 'cursorLineEnd' },
  { key: '^', command: 'cursorLineStart' },
  ...commandsThatWaitForNextInput,
];

const keyBindings = {
  normal: [
    // { key: "<Space>", command: "vimLeader" },
    { key: '<Space>tc', command: 'toggleCheckbox' },
    { key: 'diw', command: 'deleteInnerWord' },
    { key: 'i', command: 'enterInsertMode' },
    { key: 'v', command: 'enterVisualMode' },
    { key: 'V', command: 'visualStartLineWise' },
    { key: 'x', command: 'delete' },
    { key: 'y', command: 'yank' },
    { key: 'gh', command: 'hint' },
    { key: '<Control>s', command: 'save' },
    { key: '<Control>]', command: 'indentRight' },
    { key: '<Control>[', command: 'indentLeft' },
    { key: '<Enter>', command: 'newLine' },
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Meta>', command: 'nothing' },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  insert: [
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Delete>', command: 'delete' },
    { key: '<Enter>', command: 'newLine' },
    { key: '<Shift>', command: 'shift' },
    { key: Modifier['<Space>'], command: 'space' },
    { key: '<Control>', command: 'nothing' },
    ...commandsAllModes,
    ...cursorAllModes,
  ],
  visual: [
    { key: 'iw', command: 'visualInnerWord' },
    { key: 'd', command: 'visualDelete' },
    { key: 'o', command: 'visualMoveToOtherEndOfMarkedArea' },
    { key: 'x', command: 'visualDelete' },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  synonyms: {
    '<esc>': '<Escape>',
  },
} as const;

export default keyBindings;

export function isAlt(newInput: string) {
  return newInput === ALT || newInput === Modifier['<Alt>'];
}
export function isBackspace(newInput: string) {
  return newInput === BACKSPACE || newInput === Modifier['<Backspace>'];
}
export function isControl(newInput: string) {
  return newInput === CONTROL || newInput === Modifier['<Control>'];
}
export function isDelete(newInput: string) {
  return newInput === DELETE || newInput === Modifier['<Delete>'];
}
export function isEscape(newInput: string) {
  return newInput === ESCAPE || newInput === Modifier['<Escape>'];
}
export function isShift(newInput: string) {
  return newInput === SHIFT || newInput === Modifier['<Shift>'];
}
export function isSpace(newInput: string) {
  return newInput === SPACE || newInput === Modifier['<Space>'];
}
