export enum LineMarkup {
  "BOLD",
  "ITALICS",
  "HEADING1",
}

export interface LineMacros {
  name: string;
  type: MacroType;
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
  macros?: LineMacros;
}

export interface VimEditorState {
  lines: EditorLine[];
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
    },
    {
      text: "abcdef 89",
    },
  ],
};
