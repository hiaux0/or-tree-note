import { VimCommands } from "../vim-commands";

export const normalModeCommands = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
] as const;

export interface NormalModeKeybindings extends VimCommands {
  key: string;
  command: typeof normalModeCommands[number];
}
