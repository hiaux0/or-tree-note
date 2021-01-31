import { VimCommand } from '../vim-commands';

export const InsertTextModeCommands = [] as const;

export interface InsertTextModeKeybindings extends VimCommand {
  key: string;
  command: typeof InsertTextModeCommands[number];
}
