// Naming based on https://vim.rtorr.com/

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
];

const keyBindings = {
  normal: [
    // { key: "<Space>", command: "vimLeader" },
    { key: '<Space>tc', command: 'toggleCheckbox' },
    { key: 'i', command: 'enterInsertMode' },
    { key: 'v', command: 'enterVisualMode' },
    { key: 'V', command: 'visualStartLineWise' },
    { key: 'y', command: 'yank' },
    { key: 'gh', command: 'hint' },
    { key: '<Control>s', command: 'save' },
    { key: '<Control>]', command: 'indentRight' },
    { key: '<Control>[', command: 'indentLeft' },
    { key: '<Enter>', command: 'newLine' },
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  insert: [
    { key: '<Escape>', command: 'enterNormalMode' },
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Delete>', command: 'delete' },
    { key: '<Shift>', command: 'shift' },
    ...cursorAllModes,
  ],
  visual: [
    { key: '<Escape>', command: 'enterNormalMode' },
    { key: 'iw', command: 'visualInnerWord' },
    { key: 'o', command: 'visualMoveToOtherEndOfMarkedArea' },
    ...cursorAllModes,
    ...cursorNormalAndVisual,
  ],
  synonyms: {
    '<esc>': '<Escape>',
  },
} as const;

export default keyBindings;
