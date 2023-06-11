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
  OS,
  SHIFT,
  SPACE,
  TAB,
} from './app-keys';

export const Modifier = {
  '<Alt>': '<Alt>',
  '<ArrowUp>': '<ArrowUp>',
  '<ArrowDown>': '<ArrowDown>',
  '<ArrowLeft>': '<ArrowLeft>',
  '<ArrowRight>': '<ArrowRight>',
  '<Backspace>': '<Backspace>',
  '<Control>': '<Control>',
  '<Delete>': '<Delete>',
  '<Enter>': '<Enter>',
  '<Escape>': '<Escape>',
  '<OS>': '<OS>',
  '<Shift>': '<Shift>',
  '<Space>': '<Space>',
  '<Tab>': '<Tab>',
};

const commandsAllModes: VimCommand[] = [
  { key: '<Control>c', command: VIM_COMMAND['copy'] },
  { key: '<Control>z', command: VIM_COMMAND['undo'] },
  { key: '<Control><Shift>z', command: VIM_COMMAND['redo'] },
  { key: '<Escape>', command: VIM_COMMAND['enterNormalMode'] },
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
  { key: '<ArrowLeft>', command: VIM_COMMAND['cursorLeft'] },
  { key: '<ArrowUp>', command: VIM_COMMAND['cursorUp'] },
  { key: '<ArrowRight>', command: VIM_COMMAND['cursorRight'] },
  { key: '<ArrowDown>', command: VIM_COMMAND['cursorDown'] },
];

export const cursorNormalAndInsert: VimCommand[] = [
  { key: '<Control>]', command: VIM_COMMAND['indentRight'] },
  { key: '<Control>[', command: VIM_COMMAND['indentLeft'] },
];

const cursorNormalAndVisual: VimCommand[] = [
  { key: 'b', command: VIM_COMMAND['cursorBackwordsStartWord'] }, // jump backwards to the start of a word
  { key: 'e', command: VIM_COMMAND['cursorWordForwardEnd'] },
  { key: 'h', command: VIM_COMMAND['cursorLeft'] },
  { key: 'k', command: VIM_COMMAND['cursorUp'] },
  { key: 'l', command: VIM_COMMAND['cursorRight'] },
  { key: 'u', command: VIM_COMMAND['cursorDown'] },
  { key: 'w', command: VIM_COMMAND['cursorWordForwardStart'] },
  { key: '<Shift>$', command: VIM_COMMAND['cursorLineEnd'] },
  { key: '$', command: VIM_COMMAND['cursorLineEnd'] },
  { key: '<Shift>^', command: VIM_COMMAND['cursorLineStart'] },
  { key: '^', command: VIM_COMMAND['cursorLineStart'] },
  { key: '<Shift>}', command: VIM_COMMAND['jumpNextBlock'] },
  { key: '}', command: VIM_COMMAND['jumpNextBlock'] },
  { key: '<Shift>{', command: VIM_COMMAND['jumpPreviousBlock'] },
  { key: '{', command: VIM_COMMAND['jumpPreviousBlock'] },
  ...commandsThatWaitForNextInput,
];

const keyBindings: KeyBindingModes = {
  normal: [
    // { key: "<Space>", command: VIM_COMMAND["vimLeader"] },
    { key: '<Space>tc', command: VIM_COMMAND['toggleCheckbox'] },
    { key: 'cc', command: VIM_COMMAND['clearLine'] },
    { key: 'dd', command: VIM_COMMAND['deleteLine'] },
    { key: 'diw', command: VIM_COMMAND['deleteInnerWord'] },
    { key: 'i', command: VIM_COMMAND['enterInsertMode'] },
    { key: 'J', command: VIM_COMMAND['joinLine'] },
    { key: 'o', command: VIM_COMMAND['createNewLine'] },
    { key: 'v', command: VIM_COMMAND['enterVisualMode'] },
    { key: '<Shift>V', command: VIM_COMMAND['visualStartLineWise'] },
    { key: 'x', command: VIM_COMMAND['delete'] },
    { key: 'y', command: VIM_COMMAND['yank'] },
    { key: 'za', command: VIM_COMMAND['toggleFold'] },
    { key: 'gh', command: VIM_COMMAND['hint'] },
    { key: '<Control>s', command: VIM_COMMAND['save'] },
    { key: '<Control>v', command: VIM_COMMAND['paste'] },
    { key: '<Enter>', command: VIM_COMMAND['newLine'] },
    { key: '<Escape>', command: VIM_COMMAND['cancelAll'] },
    { key: '<Backspace>', command: VIM_COMMAND['backspace'] },
    { key: '<Meta>', command: VIM_COMMAND['nothing'] },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndInsert,
    ...cursorNormalAndVisual,
  ],
  insert: [
    { key: '<Backspace>', command: VIM_COMMAND['backspace'] },
    { key: '<Delete>', command: VIM_COMMAND['delete'] },
    { key: '<Enter>', command: VIM_COMMAND['newLine'] },
    { key: '<Shift>', command: VIM_COMMAND['shift'] },
    { key: Modifier['<Space>'], command: VIM_COMMAND['space'] },
    { key: '<Control>', command: VIM_COMMAND['nothing'] },
    { key: '<Tab>', command: VIM_COMMAND['tab'] },
    { key: '<Shift><Tab>', command: VIM_COMMAND['indentLeft'] },
    // snippets
    ...commandsAllModes,
    ...cursorAllModes,
  ],
  visual: [
    { key: 'iw', command: VIM_COMMAND['visualInnerWord'] },
    { key: 'd', command: VIM_COMMAND['visualDelete'] },
    { key: 'o', command: VIM_COMMAND['visualMoveToOtherEndOfMarkedArea'] },
    { key: 'x', command: VIM_COMMAND['visualDelete'] },
    ...commandsAllModes,
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  visualline: [
    { key: 'd', command: VIM_COMMAND['visualDelete'] },
    { key: 'o', command: VIM_COMMAND['visualMoveToOtherEndOfMarkedArea'] },
    { key: 'x', command: VIM_COMMAND['visualDelete'] },
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
export function isOs(newInput: string) {
  return newInput === OS || newInput === Modifier['<OS>'];
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
