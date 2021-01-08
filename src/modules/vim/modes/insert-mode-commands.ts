import { VimCommands } from "../vim-commands";

export const insertModeCommands = [] as const;

export interface InsertModeKeybindings extends VimCommands {
  key: string;
  command: typeof insertModeCommands[number];
}
