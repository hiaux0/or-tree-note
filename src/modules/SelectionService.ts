import { getSelection, createRangyRange } from 'rangy';

import { Cursor } from './vim/vim-types';

type RangyRange = ReturnType<typeof createRangyRange>;

export class SelectionService {
  static getSelection() {
    const sel = getSelection();
    return sel;
  }

  static getSingleRange() {
    const selection = document.getSelection();
    const rangeCount = selection.rangeCount;
    if (rangeCount > 1) {
      throw new Error('unsupported');
    }

    const targetRange = selection.getRangeAt(0);
    return targetRange;
  }

  static createRange(node: Node, cursor: Cursor) {
    const range = createRangyRange();

    // Col
    range.setStart(node, cursor.col);
    range.setEnd(node, cursor.col);

    // Line
    // hanlded by the `node` arg

    return range;
  }

  static setSingleRange(range: RangyRange) {
    getSelection().setSingleRange(range);
    // const range: Range = document.createRange();

    // // Col
    // range.setStart(node, cursor.col);
    // range.setEnd(node, cursor.col);

    // // Line
    // // hanlded by the `node` arg

    // document.getSelection().addRange(range);
  }
}
