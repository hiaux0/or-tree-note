import { Cursor, VimState } from 'modules/vim/vim-types';

export const VIM_TEST_WHOLEINPUT = ['foo'];
const initialCursor = { line: 0, col: 0 };

export function createVimState(
  text: string = VIM_TEST_WHOLEINPUT[0],
  cursor: Cursor = initialCursor
): VimState {
  return {
    text,
    cursor,
    lines: [text],
  };
}
