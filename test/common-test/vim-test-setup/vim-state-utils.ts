import { VimStateClass } from 'modules/vim/vim-state';
import { Cursor, VimLine } from 'modules/vim/vim-types';

export const VIM_TEST_WHOLEINPUT = ['foo'];
const initialCursor = { line: 0, col: 0 };

export function createVimState(
  text: string = VIM_TEST_WHOLEINPUT[0],
  cursor: Cursor = initialCursor
): VimStateClass {
  const lines: VimLine[] = text.split('\n').map((line) => ({ text: line }));
  return VimStateClass.create(cursor, lines);
}
