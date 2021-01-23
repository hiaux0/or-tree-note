// Naming based on https://vim.rtorr.com/

export default {
  normal: [
    // { key: "<Space>", command: "vimLeader" },
    { key: "<Space>tc", command: "toggleCheckbox" },
    { key: "h", command: "cursorLeft" },
    { key: "i", command: "enterInsertTextMode" },
    { key: "k", command: "cursorUp" },
    { key: "l", command: "cursorRight" },
    { key: "u", command: "cursorDown" },
    { key: "b", command: "cursorBackwordsStartWord" }, // jump backwards to the start of a word
    { key: "e", command: "cursorWordForwardEnd" },
    { key: "w", command: "cursorWordForwardStart" },
    { key: "<ArrowLeft>", command: "cursorLeft" },
    { key: "<ArrowUp>", command: "cursorUp" },
    { key: "<ArrowRight>", command: "cursorRight" },
    { key: "<ArrowDown>", command: "cursorDown" },
    { key: "y", command: "yank" },
    { key: "gh", command: "hint" },
    { key: "<Control>s", command: "save" },
  ],
  insert: [
    { key: "<ArrowLeft>", command: "cursorLeft" },
    { key: "<ArrowUp>", command: "cursorUp" },
    { key: "<ArrowRight>", command: "cursorRight" },
    { key: "<ArrowDown>", command: "cursorDown" },
    { key: "<Escape>", command: "enterNormalTextMode" },
    { key: "<Backspace>", command: "backspace" },
    { key: "<Delete>", command: "delete" },
    { key: "<Shift>", command: "shift" },
  ],
  synonyms: {
    "<esc>": "<Escape>",
  },
};
