import { InsertTextModeKeybindings } from "./modes/insert-mode-commands";
import { VimCommandNames, VimCommand, SynonymKey } from "./vim-commands";

export interface KeyBindingModes {
  normal: VimCommand[];
  insert: InsertTextModeKeybindings[];
  synonyms: SynonymKey;
}

export enum VimExecutingMode {
  "INDIVIDUAL" = "INDIVIDUAL",
  "BATCH" = "BATCH",
}

/**
 * Given a string 'Hello, World'
 * And I'm in normal mode
 * When I type "l"
 * Then the cursor should move one right
 */
export interface FindPotentialCommandReturn {
  targetCommand: VimCommand;
  potentialCommands: VimCommand[];
}

export type VimState = {
  cursor?: Cursor;
  text?: string;
};

export interface QueueInputReturn {
  vimState: VimState | null;
  targetCommand: VimCommandNames;
  wholeInput: string[];
}

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
}
export interface VimOptions {
  keyBindings?: KeyBindingModes;
  leader?: string;
  vimPlugins?: VimPlugin[];
}

export interface VimPlugin {
  commandName: string;
  execute: (vimState?: VimState, commandValue?: string) => VimState | void;
}
