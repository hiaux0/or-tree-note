import { getRandomId } from 'common/random';

import { Vim } from './vim';
import { VimCommand, SynonymKey, VIM_COMMAND } from './vim-commands-repository';
import { VimStateClass } from './vim-state';

export interface KeyBindingModes {
  insert?: VimCommand[];
  normal: VimCommand[];
  visual?: VimCommand[];
  visualline?: VimCommand[];
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

export type IndentationLevel = number;
export type Text = string;

export interface IndentationNode {
  text?: Text;
  indentation?: IndentationLevel;
}

export type LineId = string;
export interface VimLine extends IndentationNode {
  text: Text;
  id?: LineId; // Migration_1
  // cursor?: Cursor;
}

export const EMPTY_VIM_LINE: VimLine = { text: '', id: getRandomId() };

export type FoldMap = Record<string, boolean>;

export type VimStateV2 = {
  cursor?: Cursor;
  lines?: VimLine[];
  mode?: VimMode;
  foldMap?: FoldMap;
  visualStartCursor?: Cursor;
  visualEndCursor?: Cursor;
  deletedLinesIndeces?: number[];
  commandName?: string;
};

export interface QueueInputReturn {
  vimState: VimStateClass | null;
  targetCommand: VIM_COMMAND;
  lines: VimLine[];
}

export interface Cursor {
  col: number;
  line: number;
}
export enum VimMode {
  'NORMAL' = 'NORMAL',
  'INSERT' = 'INSERT',
  'VISUAL' = 'VISUAL',
  'VISUALLINE' = 'VISUALLINE',
}
export type VimModeKeys = keyof typeof VimMode;

export interface VimOptions {
  keyBindings?: KeyBindingModes;
  leader?: string;
  vimPlugins?: VimPlugin[];
  indentSize?: number;
}

export interface VimPlugin {
  commandName: string;
  execute: (
    vimState?: VimStateClass,
    commandValue?: string
  ) => VimStateClass | void;
}

export interface InputData {
  pressedKey: string;
  ev: KeyboardEvent;
  modifiersText: string;
}

export type CommandListener = (
  vimResults: QueueInputReturn,
  inputData?: InputData
) => void;
export type ModeChanged = (newMode: VimMode) => void;

export interface VimEditorOptions {
  commandListener: CommandListener;
  startCursor?: Cursor;
  startLines?: VimLine[];
  container?: HTMLElement;
  modeChanged?: ModeChanged;
  afterInit?: (
    vim: Vim
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
}
