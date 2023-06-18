import { getRandomId } from 'common/random';
import { ISnippet } from 'resources/keybindings/snippets/snippets';
import { EditorId } from 'store/initial-state';

import { VimCoreV2 } from '../../pages/apps/every-component/vim/vimCore/VimCoreV2';
import {
  VimCommand,
  SynonymKey,
  VIM_COMMAND,
  VimCommandNames,
} from './vim-commands-repository';
import { VimCore } from './vim-core';
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
  id?: EditorId;
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
export interface QueueInputReturnv2 {
  vimState: VimStateV2 | null;
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

export interface VimHooks {
  afterInit?: (
    vim: VimCore
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
  afterInitv2?: (
    vim: VimCoreV2
  ) => QueueInputReturnv2[] | Promise<QueueInputReturnv2[]> | void;
  onBeforeCommand?: () => boolean;
  commandListenerv2?: CommandListenerv2;
  modeChangedv2?: ModeChangedv2;
}

export interface VimOptions {
  vimState?: VimStateV2;
  keyBindings?: KeyBindingModes;
  leader?: string;
  vimPlugins?: VimPlugin[];
  indentSize?: number;
  hooks?: VimHooks;
}

export interface VimPlugin {
  commandName: string;
  execute: (
    vimState?: VimStateClass,
    commandValue?: unknown
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
  vim?: VimCore
) => void | VimStateV2;
export type CommandListenerv2 = (
  vimResult: QueueInputReturnv2
  // inputData: InputData,
  // vim?: VimCore
) => void | VimStateV2;
export type ModeChanged = (
  vimResults: QueueInputReturn,
  newMode: VimMode,
  oldMode: VimMode,
  vim?: VimCore
) => void | VimStateV2;
export type ModeChangedv2 = (
  vimResults: QueueInputReturnv2,
  newMode: VimMode,
  oldMode: VimMode,
  vim?: VimCoreV2
) => void | VimStateV2;

export interface VimEditorOptionsV2 {
  vimState?: VimStateV2;
  id?: EditorId;
  startCursor?: Cursor;
  startLines?: VimLine[];
  container?: HTMLElement;
  caret?: HTMLElement;
  childSelector?: string;
  removeTrailingWhitespace?: boolean;
  plugins?: VimPlugin[];
  afterInit?: (
    vim: VimCore
  ) => QueueInputReturn[] | Promise<QueueInputReturn[]> | void;
  afterInitv2?: (
    vim: VimCoreV2
  ) => QueueInputReturnv2[] | Promise<QueueInputReturnv2[]> | void;
  onBeforeCommand?: () => boolean;
  commandListener: CommandListener;
  commandListenerv2?: CommandListenerv2;
  modeChanged?: ModeChanged;
  modeChangedv2?: ModeChangedv2;
  onCompositionUpdate?: (vim: VimCore, event: Event) => void;
}
