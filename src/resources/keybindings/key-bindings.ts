// Naming based on https://vim.rtorr.com/

const keyBindings = {
  normal: [
    // { key: "<Space>", command: "vimLeader" },
    { key: '<Space>tc', command: 'toggleCheckbox' },
    { key: 'h', command: 'cursorLeft' },
    { key: 'i', command: 'enterInsertMode' },
    { key: 'k', command: 'cursorUp' },
    { key: 'l', command: 'cursorRight' },
    { key: 'u', command: 'cursorDown' },
    { key: 'b', command: 'cursorBackwordsStartWord' }, // jump backwards to the start of a word
    { key: 'e', command: 'cursorWordForwardEnd' },
    { key: 'v', command: 'enterVisualMode' },
    { key: 'V', command: 'visualStartLineWise' },
    { key: 'w', command: 'cursorWordForwardStart' },
    { key: '<ArrowLeft>', command: 'cursorLeft' },
    { key: '<ArrowUp>', command: 'cursorUp' },
    { key: '<ArrowRight>', command: 'cursorRight' },
    { key: '<ArrowDown>', command: 'cursorDown' },
    { key: 'y', command: 'yank' },
    { key: 'gh', command: 'hint' },
    { key: '<Control>s', command: 'save' },
    { key: '<Control>]', command: 'indentRight' },
    { key: '<Control>[', command: 'indentLeft' },
    { key: '<Enter>', command: 'newLine' },
  ],
  insert: [
    { key: '<ArrowLeft>', command: 'cursorLeft' },
    { key: '<ArrowUp>', command: 'cursorUp' },
    { key: '<ArrowRight>', command: 'cursorRight' },
    { key: '<ArrowDown>', command: 'cursorDown' },
    { key: '<Escape>', command: 'enterNormalMode' },
    { key: '<Backspace>', command: 'backspace' },
    { key: '<Delete>', command: 'delete' },
    { key: '<Shift>', command: 'shift' },
  ],
  visual: [
    { key: '<Escape>', command: 'enterNormalMode' },
    { key: 'iw', command: 'visualInnerWord' },
    { key: 'o', command: 'visualMoveToOtherEndOfMarkedArea' },
  ],
  synonyms: {
    '<esc>': '<Escape>',
  },
} as const;

export default keyBindings;
