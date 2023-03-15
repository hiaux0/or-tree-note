import { cloneDeep } from 'lodash';
import { toggleFold } from '../../../../../src/modules/vim/modes/features/folding';
import { Vim } from '../../../../../src/modules/vim/vim';
import { IndentationNode } from '../../../../../src/modules/vim/vim-types';
import {
  findCursor,
  replaceCursorFromRaw,
} from '../../../../common-test/vim-test-setup/vim-test-helpers';

describe(`Folding`, () => {
  const testNodes = [
    { indentation: 0 }, // 0
    { indentation: 0 }, // 1
    { indentation: 2 }, // 2
    { indentation: 2 }, // 3
    { indentation: 4 }, // 4
    { indentation: 4 }, // 5
    { indentation: 0 }, // 6
    { indentation: 4 }, // 7
    { indentation: 0 }, // 8
    { indentation: 0 }, // 9
  ];

  describe(`toggleFold() - not folded`, () => {
    const testCollection: [
      IndentationNode[],
      [foldIndex: number, expected: string[]][]
    ][] = [
      [
        testNodes,
        [
          [0, []],
          [1, ['2', '3', '4', '5']],
          [2, ['2', '3', '4', '5']],
          [3, ['4', '5']],
          [4, ['4', '5']],
          [5, ['4', '5']],
          [6, ['7']],
          [7, ['7']],
          [8, []],
          [9, []],
        ],
      ],
    ];
    testCollection.forEach(([nodes, testCase]) => {
      testCase.forEach(([foldIndex, expected]) => {
        it(`foldIndex: ${foldIndex}`, () => {
          const foldMap = toggleFold(foldIndex, nodes);
          expect(Object.keys(foldMap)).toEqual(expected);
          // expect(true).toBeFalsy();
        });
      });
    });
  });

  describe.only(`toggleFold() - not folded`, () => {
    const testCollection: [
      IndentationNode[],
      [foldIndex: number, expected: string[]][]
    ][] = [
      [
        testNodes,
        [
          [1, []],
          // [2, ['2', '3', '4', '5']],
          // [3, ['4', '5']],
          // [4, ['4', '5']],
          // [5, ['4', '5']],
          // [6, ['7']],
          // [7, ['7']],
          // [8, []],
          // [9, []],
        ],
      ],
    ];
    testCollection.forEach(([nodes, testCase]) => {
      testCase.forEach(([foldIndex, expected]) => {
        const alreadyFoldedMap = {
          2: true,
          3: true,
          4: true,
          5: true,
        };

        it(`foldIndex: ${foldIndex}`, () => {
          const foldMap = toggleFold(foldIndex, nodes, alreadyFoldedMap);
          foldMap; /*?*/

          const filterFolded: string[] = [];
          for (const [key, value] of Object.entries(foldMap)) {
            if (value === false) continue;
            filterFolded.push(key);
          }
          filterFolded; /*?*/

          expect(filterFolded).toEqual(expected);
        });
      });
    });
  });

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