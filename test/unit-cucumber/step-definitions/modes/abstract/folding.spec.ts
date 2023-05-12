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

  describe(`toggleFold() - nothing folded`, () => {
    const testCollection: [
      IndentationNode[],
      // [foldIndex: number, expected: string[], parentIndex: number][]
      [number, string[], number][]
    ][] = [
      [
        testNodes,
        [
          [0, [], 0],
          [1, ['2', '3', '4', '5'], 1],
          [2, ['2', '3', '4', '5'], 1],
          [3, ['4', '5'], 3],
          [4, ['4', '5'], 3],
          [5, ['4', '5'], 3],
          [6, ['7'], 6],
          [7, ['7'], 6],
          [8, [], 8],
          [9, [], 9],
        ],
      ],
    ];
    testCollection.forEach(([nodes, testCase]) => {
      testCase.forEach(([foldIndex, expected, expectedParentIndex]) => {
        it(`foldIndex: ${foldIndex}`, () => {
          const { foldMap, parentIndex } = toggleFold(foldIndex, nodes);
          expect(Object.keys(foldMap)).toEqual(expected);
          expect(parentIndex).toEqual(expectedParentIndex);
          // expect(true).toBeFalsy();
        });
      });
    });
  });

  describe(`toggleFold() - some folded`, () => {
    const testCollection: [
      IndentationNode[],
      // [foldIndex: number, expected: string[], parentIndex: number][],
      [number, string[], number][]
    ][] = [
      [
        testNodes,
        [
          [0, ['2', '3', '4', '5'], 0],
          [1, [], 1],
          // [2, [], 2],          // Should not be possible to fold ,since those lines are collapsed
          // [3, ['2', '3'], 3],  // Should not be possible to fold ,since those lines are collapsed
          // [4, ['2', '3'], 3],  // Should not be possible to fold ,since those lines are collapsed
          // [5, ['2', '3'], 5],  // Should not be possible to fold ,since those lines are collapsed
          [6, ['2', '3', '4', '5', '7'], 6],
          [7, ['2', '3', '4', '5', '7'], 6],
          [8, ['2', '3', '4', '5'], 8],
          [9, ['2', '3', '4', '5'], 9],
        ],
      ],
    ];
    testCollection.forEach(([nodes, testCase]) => {
      testCase.forEach(([foldIndex, expected, expectedParentIndex]) => {
        const alreadyFoldedMap = {
          2: true,
          3: true,
          4: true,
          5: true,
        };

        it(`foldIndex: ${foldIndex}`, () => {
          const { foldMap, parentIndex } = toggleFold(
            foldIndex,
            nodes,
            alreadyFoldedMap
          );

          const filterFolded: string[] = [];
          for (const [key, value] of Object.entries(foldMap)) {
            if (value === false) continue;
            filterFolded.push(key);
          }

          expect(filterFolded).toEqual(expected);
          expect(parentIndex).toEqual(expectedParentIndex);
        });
      });
    });
  });

  describe(`toggleFold() - with empty lines`, () => {
    const testNodesWithEmptyLines = [
      {
        text: 'What do I need to make this work?',
        indentation: 0,
      },
      {
        text: 'handy shortcuts over',
        indentation: 4,
      },
      {
        text: '',
        indentation: 0,
      },
      {
        text: '    text snippets',
        indentation: 4,
      },
      {
        text: 'tags',
        indentation: 0,
      },
    ];
    const testCollection: [
      IndentationNode[],
      // [foldIndex: number, expected: string[], parentIndex: number][]
      [number, string[], number][]
    ][] = [
      [
        testNodesWithEmptyLines,
        [
          [0, ['1', '2', '3'], 0],
          [1, ['1', '2', '3'], 0],
          [2, ['1', '2', '3'], 0],
          [3, ['1', '2', '3'], 0],
          [4, [], 4],
        ],
      ],
    ];
    testCollection.forEach(([nodes, testCase]) => {
      testCase.forEach(([foldIndex, expected, expectedParentIndex]) => {
        it(`foldIndex: ${foldIndex}`, () => {
          const { foldMap, parentIndex } = toggleFold(foldIndex, nodes);
          expect(Object.keys(foldMap)).toEqual(expected);
          expect(parentIndex).toEqual(expectedParentIndex);
          // expect(true).toBeFalsy();
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

    // expect(true).toBeFalsy();
  });
});
