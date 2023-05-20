// Naming based on https://vim.rtorr.com/

import { VimCommand, VIM_COMMAND } from 'modules/vim/vim-commands-repository';
import { KeyBindingModes } from 'modules/vim/vim-types';

import {
  ALT,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  BACKSPACE,
  CONTROL,
  DELETE,
  ENTER,
  ESCAPE,
  SHIFT,
  SPACE,
  TAB,
} from './app-keys';

export const Modifier = {
  '<Alt>': '<Alt>',
  '<Backspace>': '<Backspace>',
  '<Control>': '<Control>',
  '<Delete>': '<Delete>',
  '<Enter>': '<Enter>',
  '<Escape>': '<Escape>',
  '<Meta>': '<Meta>',
  '<Shift>': '<Shift>',
  '<Space>': '<Space>',
};

const commandsAllModes: VimCommand[] = [
  { key: '<Control>c', command: 'copy' },
  { key: '<Control>z', command: 'undo' },
  { key: '<Control><Shift>z', command: 'redo' },
  { key: '<Escape>', command: 'enterNormalMode' },
];
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

const cursorAllModes: VimCommand[] = [
  { key: '<ArrowLeft>', command: 'cursorLeft' },
  { key: '<ArrowUp>', command: 'cursorUp' },
  { key: '<ArrowRight>', command: 'cursorRight' },
  { key: '<ArrowDown>', command: 'cursorDown' },
];

export const cursorNormalAndInsert: VimCommand[] = [
  { key: '<Control>]', command: 'indentRight' },
  { key: '<Control>[', command: 'indentLeft' },
  { key: '<Control>v', command: 'paste' },
];

const cursorNormalAndVisual: VimCommand[] = [
  { key: 'b', command: 'cursorBackwordsStartWord' }, // jump backwards to the start of a word
  { key: 'e', command: 'cursorWordForwardEnd' },
  { key: 'h', command: 'cursorLeft' },
  { key: 'k', command: 'cursorUp' },
  { key: 'l', command: 'cursorRight' },
  { key: 'u', command: 'cursorDown' },
  { key: 'w', command: 'cursorWordForwardStart' },
  { key: '<Shift>$', command: 'cursorLineEnd' },
  { key: '<Shift>^', command: 'cursorLineStart' },
  { key: '<Shift>}', command: 'jumpNextBlock' },
  { key: '<Shift>{', command: 'jumpPreviousBlock' },
  ...commandsThatWaitForNextInput,
];

const keyBindings: KeyBindingModes = {
  normal: [
    // { key: "<Space>", command: "vimLeader" },
    { key: '<Space>tc', command: 'toggleCheckbox' },
    { key: 'cc', command: 'clearLine' },
    { key: 'dd', command: 'deleteLine' },
    { key: 'diw', command: 'deleteInnerWord' },
    { key: 'i', command: 'enterInsertMode' },
    { key: 'J', command: 'joinLine' },
    { key: 'o', command: 'createNewLine' },
    { key: 'v', command: 'enterVisualMode' },
    { key: '<Shift>V', command: 'visualStartLineWise' },
    { key: 'x', command: 'delete' },
    { key: 'y', command: 'yank' },
    { key: 'za', command: 'toggleFold' },
    { key: 'gh', command: 'hint' },
    { key: '<Control>s', command: 'save' },
    { key: '<Enter>', command: 'newLine' },
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Meta>', command: 'nothing' },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndInsert,
    ...cursorNormalAndVisual,
  ],
  insert: [
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Delete>', command: 'delete' },
    { key: '<Enter>', command: 'newLine' },
    { key: '<Shift>', command: 'shift' },
    { key: Modifier['<Space>'], command: 'space' },
    { key: '<Control>', command: 'nothing' },
    { key: '<Tab>', command: 'indentRight' },
    { key: '<Shift><Tab>', command: 'indentLeft' },
    // snippets
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
  visualline: [
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
};

export default keyBindings;

export function isAlt(newInput: string) {
  return newInput === ALT || newInput === Modifier['<Alt>'];
}
export function isArrowUp(newInput: string) {
  return newInput === ARROW_UP || newInput === Modifier['<ArrowUp>'];
}
export function isArrowDown(newInput: string) {
  return newInput === ARROW_DOWN || newInput === Modifier['<ArrowDown>'];
}
export function isArrowLeft(newInput: string) {
  return newInput === ARROW_LEFT || newInput === Modifier['<ArrowLeft>'];
}
export function isArrowRight(newInput: string) {
  return newInput === ARROW_RIGHT || newInput === Modifier['<ArrowRight>'];
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
export function isEnter(newInput: string) {
  return newInput === ENTER || newInput === Modifier['<Enter>'];
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
export function isTab(newInput: string) {
  return newInput === TAB || newInput === Modifier['<Tab>'];
}
