export default {
  normal: [
    { key: "h", command: "cursorLeft" },
    { key: "i", command: "enterInsertMode" },
    { key: "k", command: "cursorUp" },
    { key: "l", command: "cursorRight" },
    { key: "u", command: "cursorDown" },
    { key: "ArrowLeft", command: "cursorLeft" },
    { key: "ArrowUp", command: "cursorUp" },
    { key: "ArrowRight", command: "cursorRight" },
    { key: "ArrowDown", command: "cursorDown" },
    {
      key: "y",
      command: "yank",
    },
  ],
  insert: [
    { key: "ArrowLeft", command: "cursorLeft" },
    { key: "ArrowUp", command: "cursorUp" },
    { key: "ArrowRight", command: "cursorRight" },
    { key: "ArrowDown", command: "cursorDown" },
  ],
};
