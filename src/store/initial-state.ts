import { Cursor } from "modules/vim/vim.types";

export enum LineMarkup {
  "BOLD",
  "ITALICS",
  "HEADING1",
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
  "CHECKBOX" = "CHECKBOX",
  "MARK" = "MARK",
  "DEFINITIONS" = "DEFINITIONS",
  "SNIPPETS" = "SNIPPETS",
}

export interface EditorLine {
  text: string;
  markup?: LineMarkup;
  macros?: LineMacro[];
  macro?: LineMacro;
}

export interface VimEditorState {
  lines: EditorLine[];
  cursorBeforeRefresh?: Cursor;
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
  lines: [
    {
      text: "012 456",
      macro: {
        checkbox: {
          value: true,
        },
      },
    },
    {
      text: "abcdef 89",
    },
  ],
};
