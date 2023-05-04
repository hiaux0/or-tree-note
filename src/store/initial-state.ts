import { Cursor, VimStateV2 } from 'modules/vim/vim-types';

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
  text: string;
  markup?: LineMarkup;
  macro?: LineMacro;
}

export interface IVimEditor {
  lines: EditorLine[];
  vimState?: VimStateV2;
}

export type EditorIds = number[];

export interface VimEditorState {
  editors?: IVimEditor[];
  activeEditorIds?: EditorIds;
  lines: EditorLine[];
  vimState?: VimStateV2;
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
  editors: [
    {
      lines: [
        {
          text: 'from editor abcdef 89',
        },
        {
          text: '012 456',
          macro: {
            checkbox: {
              value: true,
            },
          },
        },
      ],
    },
    {
      lines: [
        {
          text: 'one two three',
          macro: {
            checkbox: {
              value: true,
            },
          },
        },
        { text: 'other' },
      ],
    },
  ],
  activeEditorIds: [0],
  lines: [
    {
      text: 'abcdef 89',
    },
    {
      text: '012 456',
      macro: {
        checkbox: {
          value: true,
        },
      },
    },
  ],
};
