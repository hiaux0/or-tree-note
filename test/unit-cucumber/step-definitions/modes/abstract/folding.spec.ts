import { cloneDeep } from 'lodash';
import { Vim } from '../../../../../src/modules/vim/vim';
import {
  findCursor,
  replaceCursorFromRaw,
} from '../../../../common-test/vim-test-setup/vim-test-helpers';

describe(`Folding`, () => {
  it(`Folding`, () => {
    const rawContent = `|123\n  456\n789`;
    const rawInput = rawContent.split('\n');
    const input = replaceCursorFromRaw(rawInput).map((text) => ({
      text,
    }));

    // If we provide rawContent, then also a cursor
    let vim: Vim;
    if (rawContent) {
      const initialCursor = findCursor(rawInput);
      vim = new Vim(cloneDeep(input), initialCursor);
    } else {
      vim = new Vim(cloneDeep(input));
    }

    const result = vim.queueInput('za');
    result; /*?*/

    expect(true).toBeFalsy();
  });
});
