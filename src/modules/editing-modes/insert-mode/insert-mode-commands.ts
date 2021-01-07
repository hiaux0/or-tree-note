export const insertModeCommands = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
] as const;

export interface InsertModeKeybindings {
  key: string;
  command: typeof insertModeCommands[number];
}
