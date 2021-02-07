import { VimCommandNames, VimCommand, SynonymKey } from './vim-commands-repository';

export interface KeyBindingModes {
  normal: VimCommand[];
  synonyms: SynonymKey;
}

export enum VimExecutingMode {
  'INDIVIDUAL' = 'INDIVIDUAL',
  'BATCH' = 'BATCH',
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
  cursor: Cursor;
  text: string;
  mode?: VimMode;
  visualStartCursor?: Cursor;
  visualEndCursor?: Cursor;
};

export interface QueueInputReturn {
  vimState: VimState | null;
  targetCommand: VimCommandNames;
  lines: string[];
}

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  'NORMAL' = 'NORMAL',
  'INSERT' = 'INSERT',
  'VISUAL' = 'VISUAL',
}
export interface VimOptions {
  keyBindings?: KeyBindingModes;
  leader?: string;
  vimPlugins?: VimPlugin[];
  indentSize?: number;
}

export interface VimPlugin {
  commandName: string;
  execute: (vimState?: VimState, commandValue?: string) => VimState | void;
}
