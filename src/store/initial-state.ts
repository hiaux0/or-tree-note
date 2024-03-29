import { VimStateV2 } from 'modules/vim/vim-types';

export interface HighlightCoords {
  start: number;
  end: number;
}

export enum LineMarkup {
  'BOLD',
  'ITALICS',
  'HEADING1',
}

export interface CheckboxMacro {
  value: boolean;
}

export interface LineMacro {
  checkbox: CheckboxMacro;
  name?: string;
  type?: MacroType;
  value?: boolean;
}

export enum MacroType {
  'CHECKBOX' = 'CHECKBOX',
  'MARK' = 'MARK',
  'DEFINITIONS' = 'DEFINITIONS',
  'SNIPPETS' = 'SNIPPETS',
}

export enum LineStageValue {
  'BACKLOG' = 'BACKLOG',
  'CONSIDER' = 'CONSIDER',
  'DONE' = 'DONE',
  'ONHOLD' = 'ONHOLD',
}

export interface LineStage {
  value: LineStageValue;
  /**
   * Can customize the title of the stage.
   * Eg. You want to name "Done" "Finished"
   */
  title?: string | LineStageValue;
}

export interface EditorLine {
  lineHighlight?: HighlightCoords;
  markup?: LineMarkup;
  macro?: LineMacro;
}

export type EditorId = string;
export type EditorIds = EditorId[];

export interface IVimEditor {
  name?: string;
  linesAddons: Record<string, EditorLine>; // Migration_3
  vimState?: VimStateV2;
}

export interface VimEditorState {
  editors?: Record<EditorId, IVimEditor>;
  activeEditorIds?: EditorIds;
}

/**
 * - Lines
 *   - markup?
 *   - indentation
 *     - folding
 *   - What's the need of nested hierarchy?
 * - checkbox
 * - mark
 * - footnotes
 * - definitions
 * - snippets
 */
export const initialVimEditorState: VimEditorState = {
  editors: {
    '0': {
      vimState: {},
      linesAddons: {
        'one two three': {
          macro: {
            checkbox: {
              value: true,
            },
          },
        },
      },
    },
  },
  activeEditorIds: ['0'],
};
