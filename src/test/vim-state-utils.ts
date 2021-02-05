import { Cursor, VimState } from 'modules/vim/vim.types';

export const VIM_TEST_WHOLEINPUT = ['foo'];
const initialCursor = { line: 0, col: 0 };

export function createVimState(cursor: Cursor = initialCursor): VimState {
  return {
    text: VIM_TEST_WHOLEINPUT[0],
    cursor,
  };
}
