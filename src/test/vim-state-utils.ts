import { Cursor, VimState } from 'modules/vim/vim.types';

const input = ['foo'];
const initialCursor = { line: 0, col: 0 };

export function createVimState(cursor: Cursor = initialCursor): VimState {
  return {
    text: input[0],
    cursor,
  };
}
