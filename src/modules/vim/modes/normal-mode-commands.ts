export const normalModeCommands = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
] as const;

export interface NormalModeKeybindings {
  key: string;
  command: typeof normalModeCommands[number];
}
