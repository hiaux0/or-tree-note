export const VIM_COMMANDS = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
  "type",
  "enterInsertMode",
] as const;

export type VimCommandNames = typeof VIM_COMMANDS[number];

export interface VimCommands {
  key: string;
  command: VimCommandNames;
}
