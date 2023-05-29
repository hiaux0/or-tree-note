import { getRandomId } from 'common/random';
import { ISnippet } from 'resources/keybindings/snippets/snippets';

import { Vim } from './vim';
import {
  VimCommand,
  SynonymKey,
  VIM_COMMAND,
  VimCommandNames,
} from './vim-commands-repository';
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
  commandName?: VimCommandNames;
  snippet?: ISnippet;
};

export interface QueueInputReturn {
  vimState: VimStateClass | null;
  targetCommand: VIM_COMMAND;
}

/**
 * 0 based index
 */
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
  inputData: InputData,
  vim: Vim
) => void;
export type ModeChanged = (
  vimResults: QueueInputReturn,
  newMode: VimMode,
  vim: Vim
) => void;

export interface VimEditorOptionsV2 {
  startCursor?: Cursor;
  startLines?: VimLine[];
  container?: HTMLElement;
  caret?: HTMLElement;
  childSelector?: string;
  removeTrailingWhitespace?: boolean;
  plugins?: VimPlugin[];
  afterInit?: (
    vim: Vim
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
  commandListener: CommandListener;
  modeChanged?: ModeChanged;
  onCompositionUpdate?: (vim: Vim, event: Event) => void;
}
