import { VimCommand } from "../vim-commands";

export const insertModeCommands = [] as const;

export interface InsertModeKeybindings extends VimCommand {
  key: string;
  command: typeof insertModeCommands[number];
}
