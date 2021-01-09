import { VimCommand } from "../vim-commands";

export const normalModeCommands = [
  "cursorRight",
  "cursorUp",
  "cursorLeft",
  "cursorDown",
  "yank",
] as const;

export interface NormalTextModeKeybindings extends VimCommand {
  key: string;
  command: typeof normalModeCommands[number];
}
