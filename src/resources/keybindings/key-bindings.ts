// Naming based on https://vim.rtorr.com/

import { VimCommand } from 'modules/vim/vim-commands-repository';
import { KeyBindingModes } from 'modules/vim/vim.types';

const commandsAllModes = [{ key: '<Escape>', command: 'enterNormalMode' }];
export const commandsThatWaitForNextInput: VimCommand[] = [
  { key: 'F', command: 'toCharacterAtBack' },
  { key: 'f', command: 'toCharacterAt' },
  { key: 'r', command: 'replace' },
  { key: 'T', command: 'toCharacterAfterBack' },
  { key: 't', command: 'toCharacterBefore' },
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
