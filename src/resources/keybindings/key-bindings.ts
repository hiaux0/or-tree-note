export default {
  normal: [
    { key: "h", command: "cursorLeft" },
    { key: "i", command: "enterInsertTextMode" },
    { key: "k", command: "cursorUp" },
    { key: "l", command: "cursorRight" },
    { key: "u", command: "cursorDown" },
    { key: "ArrowLeft", command: "cursorLeft" },
    { key: "ArrowUp", command: "cursorUp" },
    { key: "ArrowRight", command: "cursorRight" },
    { key: "ArrowDown", command: "cursorDown" },
    { key: "y", command: "yank" },
    { key: "gh", command: "hint" },
  ],
  insert: [
    { key: "ArrowLeft", command: "cursorLeft" },
    { key: "ArrowUp", command: "cursorUp" },
    { key: "ArrowRight", command: "cursorRight" },
    { key: "ArrowDown", command: "cursorDown" },
    { key: "Escape", command: "enterNormalTextMode" },
  ],
  synonyms: {
    "<esc>": "Escape",
  },
};
