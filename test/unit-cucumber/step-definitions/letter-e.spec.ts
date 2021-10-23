import { cloneDeep } from 'lodash';
import { Vim } from 'modules/vim/vim';
import {
  VIM_COMMANDS,
  VimCommandNames,
} from 'modules/vim/vim-commands-repository';
import { Cursor, QueueInputReturn, VimMode } from 'modules/vim/vim.types';
import { TestError, testError } from '../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../common-test/gherkin/gherkin-test-util';

interface RawTestCase {
  rawContent: string;
  rawInput: string;
  rawCommands: string;
  numOfLines?: number;
  rawLines: string;
  rawColumns: string;
  rawTexts?: string;
  previousText?: string;
  mode?: VimMode;
  expectedMode?: VimMode;
  focus?: boolean;
}

interface TestCase {
  [key: string]: RawTestCase[];
}

const TWO_LINES_NUMBERS = `012 456
789`;
const TWO_LINES_WORDS = `foo
bar`;

function addCursorAt(line: number, textWithCursor: string, rawInput: string) {
  const input = rawInput.split('\n');
  input[line] = textWithCursor;
  return input.join('\n');
}

/* prettier-ignore */
let newTestCases: TestCase = {
      b: [
      {        rawContent: '|012 456',                                     rawInput: 'b',        rawCommands: 'cursorBackwordsStartWord',           rawLines: '0',     rawColumns: '0', },
      {        rawContent: '012 45|6',                                     rawInput: 'b',        rawCommands: 'cursorBackwordsStartWord',           rawLines: '0',     rawColumns: '4', },
      {        rawContent: '012 45|6',                                     rawInput: 'bb',       rawCommands: 'cursorBackwordsStartWord,',          rawLines: '0,',    rawColumns: '4,0', },
      ],
      d: [
      {        rawContent: '|012 456',                                     rawInput: 'diw',      rawCommands: 'deleteInnerWord',                    rawLines: '0',     rawColumns: '0',       rawTexts: ' 456' },
      ],
      e: [
      {        rawContent: '|012 456',                                     rawInput: 'e',        rawCommands: 'cursorWordForwardEnd',               rawLines: '0',     rawColumns: '2', },
      {        rawContent: '|012 456',                                     rawInput: 'eee',      rawCommands: 'cursorWordForwardEnd,,',             rawLines: '0,,',   rawColumns: '2,6,', },
      ],
      f: [
      {        rawContent: '|012 456',                                     rawInput: 'f0',       rawCommands: 'toCharacterAt',                      rawLines: '0',     rawColumns: '0', },
      {        rawContent: '01|2 456',                                     rawInput: 'f0',       rawCommands: 'toCharacterAt',                      rawLines: '0',     rawColumns: '2', },
      {        rawContent: '01|2 456',                                     rawInput: 'f5',       rawCommands: 'toCharacterAt',                      rawLines: '0',     rawColumns: '5', },
      ],
      h: [
      {        rawContent: '|012 456',                                     rawInput: 'h',        rawCommands: 'cursorLeft',                         rawLines: '0',     rawColumns: '0', },
      {        rawContent: '01|2 456',                                     rawInput: 'h',        rawCommands: 'cursorLeft',                         rawLines: '0',     rawColumns: '1', },
      ],
      i: [
      {        rawContent:'',                                              rawInput: 'i',        rawCommands: 'enterInsertMode',                    rawLines: '0',     rawColumns: '0', },
      ],
      k: [
      {        rawContent: addCursorAt(0, '|foo', TWO_LINES_WORDS),        rawInput: 'k',        rawCommands: 'cursorUp',                           rawLines: '0',     rawColumns: '0',       rawTexts: 'foo' },
      {        rawContent: addCursorAt(1, '|bar', TWO_LINES_WORDS),        rawInput: 'k',        rawCommands: 'cursorUp',                           rawLines: '0',     rawColumns: '0',       rawTexts: 'foo' },
      ],
      l: [
      {        rawContent: '|foo',                                         rawInput: 'll',       rawCommands: 'cursorRight,',                       rawLines: '0,',    rawColumns: '1,2',     rawTexts: 'foo,'},
      {        rawContent: '|foo',                                         rawInput: 'lli!',     rawCommands: 'cursorRight,,enterInsertMode,type',  rawLines: '0,,,',  rawColumns: '1,2,,3',  rawTexts: 'foo,,,fo!o'},
      ],
      t: [
      {        rawContent: '|012 456',                                     rawInput: 't0',       rawCommands: 'toCharacterBefore',                  rawLines: '0',     rawColumns: '0', },
      {        rawContent: '01|2 456',                                     rawInput: 't0',       rawCommands: 'toCharacterBefore',                  rawLines: '0',     rawColumns: '2', },
      {        rawContent: '01|2 456',                                     rawInput: 't5',       rawCommands: 'toCharacterBefore',                  rawLines: '0',     rawColumns: '4', },
      ],
      u: [
      {        rawContent: addCursorAt(0, '|foo', TWO_LINES_WORDS),        rawInput: 'u',        rawCommands: 'cursorDown',                         rawLines: '1',     rawColumns: '0',       rawTexts: 'bar' },
      {        rawContent: addCursorAt(0, '|bar', TWO_LINES_WORDS),        rawInput: 'u',        rawCommands: 'cursorDown',                         rawLines: '1',     rawColumns: '0',       rawTexts: 'bar' },
      ],
      v: [
      {        rawContent:'',                                              rawInput: 'v',        rawCommands: 'enterVisualMode',                    rawLines: '0',     rawColumns: '0', },
      ],

  // l
  // {  focus:true, rawContent: '|012 456',  rawInput: 'h',  rawCommands: 'cursorLeft',  rawLines: '0',  rawColumns: '0', },
  // {  focus:true, rawContent: addCursorAt(0, '|foo', TWO_LINES_WORDS),  rawInput: 'k',  rawCommands: 'cursorUp',  rawLines: '0',  rawColumns: '0', rawTexts: 'foo' },
  /** Modifiers */
      Enter: [
      {        rawContent: '|012 456',                                     rawInput: '<Enter>',  rawCommands: 'newLine',                            rawLines: '1',     rawColumns: '0',       rawTexts: '012 456' },
      {        rawContent: '01|2 456',                                     rawInput: '<Enter>',  rawCommands: 'newLine',                            rawLines: '1',     rawColumns: '0',       rawTexts: '2 456', previousText: '01' },
      {        rawContent: addCursorAt(0, '01|2 456', TWO_LINES_NUMBERS),  rawInput: '<Enter>',  rawCommands: 'newLine',                            rawLines: '1',     rawColumns: '0',       rawTexts: '2 456', previousText: '01', numOfLines: 3 },
      {        rawContent: '012 456|',                                     rawInput: '<Enter>',  rawCommands: 'newLine',                            rawLines: '1',     rawColumns: '0',       rawTexts: '', previousText: '012 456', numOfLines: 2 },
      ],
};

let initialCursor;
let vim: Vim;
let manyQueuedInput;

describe('Vim input', () => {
  afterEach(() => {
    // vim = null;
    // initialCursor = null;
    // manyQueuedInput = null;
  });

  Object.entries(newTestCases).forEach(([letter, testCases]) => {
    const focussedTestCases = testCases.filter((testCase) => testCase.focus);

    if (focussedTestCases.length > 0) {
      testCases = focussedTestCases;
    }

    testCases.forEach(
      ({
        rawContent,
        rawInput,
        rawCommands,
        numOfLines,
        rawLines,
        rawColumns,
        rawTexts,
        previousText,
        mode,
        expectedMode,
      }) => {
        const finalMode = mode || VimMode.NORMAL;
        describe(`Letter - ${letter}`, () => {
          describe(`${rawInput} - ${rawCommands}`, () => {
            it(`Given I activate Vim with the following input: ${rawContent}`, () => {
              rawContent; /*?*/
              const rawInput = rawContent.split('\n');

              // If we provide rawContent, then also find cursor
              if (rawContent) {
                initialCursor = findCursor(rawInput);
                initialCursor; /*?*/
              }

              const input = replaceCursorFromRaw(rawInput);
              vim = new Vim(cloneDeep(input), initialCursor);
            });

            it(`And I'm in ${finalMode} mode.`, () => {
              switch (finalMode.toLowerCase()) {
                case 'insert': {
                  vim.enterInsertMode();
                  expect(vim.vimState.mode).toBe(VimMode.INSERT);
                  break;
                }
                case 'normal': {
                  vim.enterNormalMode();
                  expect(vim.vimState.mode).toBe(VimMode.NORMAL);
                  break;
                }
                case 'visual': {
                  vim.enterVisualMode();
                  expect(vim.vimState.mode).toBe(VimMode.VISUAL);
                  break;
                }
                default: {
                  throw new TestError('Not valid/supported mode');
                }
              }
            });

            it(`When I type ${rawInput}`, () => {
              const input = GherkinTestUtil.replaceQuotes(rawInput);

              manyQueuedInput = vim.queueInputSequence(input);
              // manyQueuedInput; /*?*/
            });

            it(`Then the expected commands should be ${rawCommands}`, () => {
              const conmmands = rawCommands.split(',');
              expect(conmmands.length).toBe(
                manyQueuedInput.length,
                'Expected equal commands of lines and result'
              );

              let expectedCommand = null;
              conmmands.forEach((command, index) => {
                expectedCommand = memoizeExpected(command, expectedCommand);

                theExpectedCommandShouldBe(
                  manyQueuedInput[index],
                  expectedCommand
                );
              });
            });

            if (numOfLines !== undefined) {
              it(`there should be ${numOfLines} lines`, () => {
                manyQueuedInput; /*?*/
                expect(
                  manyQueuedInput[manyQueuedInput.length - 1].lines.length
                ).toBe(Number(numOfLines), 'hi');
              });
            }

            it(`And the cursors should be at line ${rawLines} and column ${rawColumns}`, () => {
              const columns = rawColumns.split(',');
              expect(columns.length).toBe(manyQueuedInput.length);

              let expectedColumn;
              columns.forEach((column, index) => {
                expectedColumn = memoizeExpected(column, expectedColumn);

                expect(manyQueuedInput[index].vimState.cursor.col).toEqual(
                  Number(expectedColumn),
                  `Expected equal number of columns and result. Test index: ${index}`
                );
              });

              const lines = rawLines.split(',');
              expect(lines.length).toBe(
                manyQueuedInput.length,
                'Expected equal number of lines and result'
              );
              let expectedLine;
              lines.forEach((line, index) => {
                expectedLine = memoizeExpected(line, expectedLine);
                expect(manyQueuedInput[index].vimState.cursor.line).toEqual(
                  Number(expectedLine)
                );
              });
            });

            if (rawTexts !== undefined) {
              it(`the texts should be ${rawTexts}`, () => {
                const rawTextsSplit = rawTexts.split(',');

                let lastExpectedText = '';
                rawTextsSplit.forEach((rawText, index) => {
                  const text = GherkinTestUtil.replaceQuotes(rawText);
                  lastExpectedText = memoizeExpected(text, lastExpectedText);

                  expect(manyQueuedInput[index].vimState.getActiveLine()).toBe(
                    lastExpectedText
                  );
                });
              });
            }

            if (previousText !== undefined) {
              it(`And the previous line text should be ${previousText}`, () => {
                const previousLine =
                  manyQueuedInput[manyQueuedInput.length - 1].lines[
                    initialCursor.line
                  ];
                expect(previousLine).toBe(previousText);
              });
            }

            // Modes
            if (expectedMode !== undefined) {
              it(`the I should go into ${expectedMode} mode`, () => {
                switch (mode.toLocaleLowerCase()) {
                  case 'insert': {
                    expect(vim.vimState.mode).toBe(VimMode.INSERT);
                    break;
                  }
                  case 'normal': {
                    expect(vim.vimState.mode).toBe(VimMode.NORMAL);
                    break;
                  }
                  case 'visual': {
                    expect(vim.vimState.mode).toBe(VimMode.VISUAL);
                    break;
                  }
                  default: {
                    throw new TestError('Not valid/supported mode');
                  }
                }
              });
            }
          });
        });
      }
    );
  });
});

/**
 * @example
 * const input = `
 * foo
 * b|ar
 * `
 * findCursor(input) // {col: 1, line: 1}
 *
 */
function findCursor(input: string[]): Cursor {
  input; /*?*/
  let cursorLine: number | undefined;
  let cursorColumn: number | undefined;
  input.forEach((line, index) => {
    const matchedCursor = matchCursor(line);
    matchedCursor; /*?*/
    if (matchedCursor === null) return;
    if (cursorLine !== undefined && cursorColumn !== undefined) {
      /* prettier-ignore */ logAlreadyFoundCursorError(cursorLine, cursorColumn, index, matchedCursor);
    }

    /* prettier-ignore */
    if (matchedCursor[0][1] === '|') { // \|
      cursorColumn = matchedCursor.index - 1; // - 1 for \
    } else {
      cursorColumn = matchedCursor.index;
    }

    cursorLine = index;
  });

  return {
    col: cursorColumn,
    line: cursorLine,
  };
}

/**
 * @example
 * |foo or \|foo
 */
function matchCursor(line: string) {
  const cursorPositionRegExp = /(\\\|)|(\|)/g;
  const matchedCursor = cursorPositionRegExp.exec(line);
  return matchedCursor;
}

function logAlreadyFoundCursorError(
  cursorLine: number,
  cursorColumn: number,
  index: number,
  matchedCursor: RegExpExecArray
) {
  testError.log('Found more than one cursor. Should only have one.');
  testError.log(
    `First cursor at: Line: ${cursorLine} - Column: ${cursorColumn}`
  );
  testError.log(
    `Second cursor at: Line: ${index} - Column: ${matchedCursor.index}`
  );
}

function replaceCursorFromRaw(rawInput: string[]) {
  const result = rawInput.map((line) => {
    const isCursorMatch = matchCursor(line);
    if (isCursorMatch) {
      const [cursorChar] = isCursorMatch;
      return line.replace(cursorChar, '');
    }

    return line;
  });
  return result;
}

function theExpectedCommandShouldBe(
  expectedInput: QueueInputReturn,
  rawCommand: string
) {
  const command = GherkinTestUtil.replaceQuotes(rawCommand);

  verifyCommandsName(command);

  expect(expectedInput.targetCommand).toBe(command);
}

/**
 * Better DX: allow sth like "foo,,,bar"
 */
function memoizeExpected(input: string, expected: string) {
  if (input === '') {
    // use expected
  } else if (expected !== input) {
    expected = input;
  } else if (input === undefined) {
    testError.log('Expected results and inputs not equal');
  }

  return expected;
}

function verifyCommandsName(command: string) {
  const isValid = VIM_COMMANDS.includes(<VimCommandNames>command);

  if (!isValid) {
    // testError.log(`Command not in list, was: >> ${command} <<.`);
    throw new TestError(`Command not in list, was: >> ${command} <<.`);
  }

  return true;
}
