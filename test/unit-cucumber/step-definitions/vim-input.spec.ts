import { cloneDeep } from 'lodash';
import { Vim } from '../../../src/modules/vim/vim';
import {
  VIM_COMMANDS,
  VIM_COMMAND,
} from '../../../src/modules/vim/vim-commands-repository';
import {
  Cursor,
  QueueInputReturn,
  VimMode,
} from '../../../src/modules/vim/vim-types';

import { TestError, testError } from '../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../common-test/gherkin/gherkin-test-util';

// !! sucrase and ts-jest not able to handle named typed arrays
type TestCaseList = [
  /* testCaseOptions */ TestCaseOptions,
  /* rawContent */ string,
  /* rawInput */ string,
  /* rawColumns */ string,
  /* rawCommands */ string,
  /* moreAssertions */ MoreTestCaseAssertions?
];

interface TestCaseOptions {
  focus?: boolean;
}

interface MoreTestCaseAssertions {
  rawLines?: string;
  rawTexts?: string;
  numOfLines?: number;
  previousText?: string;
  mode?: VimMode;
  expectedMode?: VimMode;
  focus?: boolean;
}

const RAW_SPLIT = ';';

const TWO_LINES_NUMBERS = `012 456
789`;
const TWO_LINES_WORDS = `foo
bar`;

function addCursorAt(line: number, textWithCursor: string, rawInput: string) {
  const input = rawInput.split('\n');
  input[line] = textWithCursor;
  return input.join('\n');
}

let initialCursor: Cursor;
let vim: Vim;
let manyQueuedInput: QueueInputReturn[] = [];

/* prettier-ignore */
let testCaseAsList: TestCaseList[] = [
    //    , 'rawContent'     , 'rawInput'    , 'rawColumns'   , 'rawCommands'                                ,
    [ {}  , '|012 456'       , 'b'           , '0'            , 'cursorBackwordsStartWord'                   , ]                           ,
    [ {}  , '012 45|6'       , 'b'           , '4'            , 'cursorBackwordsStartWord'                   , ]                           ,
    [ {}  , '012 45|6'       , 'bb'          , '4;0'          , 'cursorBackwordsStartWord;'                  , ]                           ,
    [ {}  , '012 |456'       , 'diw'         , '4'            , 'deleteInnerWord'                            , {rawTexts: '`012 `'}]       ,
    [ {}  , '|012 456'       , 'diw'         , '0'            , 'deleteInnerWord'                            , {rawTexts: '` 456`'}]       ,
    [ {}  , '|012 456'       , 'e'           , '2'            , 'cursorWordForwardEnd'                       , ]                           ,
    [ {}  , '| 12'           , 'e'           , '2'            , 'cursorWordForwardEnd'                       , ]                           ,
    [ {}  , '|012 456'       , 'eee'         , '2;6;'         , 'cursorWordForwardEnd;;'                     , ]                           ,
    [ {}  , '012 4|56'       , 'F0'          , '0'            , 'toCharacterAtBack'                          , ]                           ,
    [ {}  , '012 4|56'       , 'F6'          , '5'            , 'toCharacterAtBack'                          , ]                           ,
    [ {}  , '|012 456'       , 'f0'          , '0'            , 'toCharacterAt'                              , ]                           ,
    [ {}  , '01|2 456'       , 'f0'          , '2'            , 'toCharacterAt'                              , ]                           ,
    [ {}  , '01|2 456'       , 'f5'          , '5'            , 'toCharacterAt'                              , ]                           ,
    [ {}  , '|012 456'       , 'h'           , '0'            , 'cursorLeft'                                 , ]                           ,
    [ {}  , '01|2 456'       , 'h'           , '1'            , 'cursorLeft'                                 , ]                           ,
    [ {}  , ''               , 'i'           , '0'            , 'enterInsertMode'                            , ]                           ,
    [ {}  , '|foo\nbar'      , 'k'           , '0'            , 'cursorUp'                                   , {rawTexts: 'foo' }]         ,
    [ {}  , 'foo\n|bar'      , 'k'           , '0'            , 'cursorUp'                                   , {rawTexts: 'foo' }]         ,
    [ {}  , 'hi\n012 456|'   , 'k'           , '1'            , 'cursorUp'                                   , {rawTexts: 'hi' }]          ,
    [ {}  , '|foo'           , 'll'          , '1;2'          , 'cursorRight;'                               , {rawTexts: 'foo;'}]         ,
    [ {}  , '|foo'           , 'lli!'        , '1;2;;3'       , 'cursorRight;;enterInsertMode;type'          , {rawTexts: 'foo;;;fo!o'}]   ,
    [ {}  , '|012 456'       , 't0'          , '0'            , 'toCharacterBefore'                          , ]                           ,
    [ {}  , ''               , 'v'           , '0'            , 'enterVisualMode'                            , ]                           ,
    [ {}  , '012 4|56'       , 'T0'          , '1'            , 'toCharacterAfterBack'                       , ]                           ,
    [ {}  , '012 4|56'       , 'T6'          , '5'            , 'toCharacterAfterBack'                       , ]                           ,
    [ {}  , '01|2 456'       , 't0'          , '2'            , 'toCharacterBefore'                          , ]                           ,
    [ {}  , '01|2 456'       , 't5'          , '4'            , 'toCharacterBefore'                          , ]                           ,
    [ {}  , '|foo'      , 'rx'           , '0'            , 'replace'                                 , { rawTexts: 'xoo'} ]           ,
    [ {}  , '|foo\nbar'      , 'u'           , '0'            , 'cursorDown'                                 , {rawLines: '1'              , rawTexts: 'bar'} ]           ,
    [ {}  , 'foo\n|bar'      , 'u'           , '0'            , 'cursorDown'                                 , {rawLines: '1'              , rawTexts: 'bar'} ]           ,
    [ {}  , '|hi\n012 456'   , 'uee'         , '0;2;6'        , 'cursorDown;cursorWordForwardEnd;'           , {rawLines: '1;;'            , rawTexts: '012 456;;'} ]     ,
    [ {}  , '|hi\n012 456'   , 'ueek'        , '0;2;6;1'      , 'cursorDown;cursorWordForwardEnd;;cursorUp'  , {rawLines: '1;;;0'          , rawTexts: '012 456;;;hi'} ]  ,
    [ {}  , '012 456|'       , '^'           , '0'            , 'cursorLineStart'                            , ]                           ,
    [ {}  , '|012 456'       , '$'           , '6'            , 'cursorLineEnd'                              , ]                           ,
    [ {}  , '|012 456'       , '<Control>]'  , '4'            , 'indentRight'                                , {rawTexts: '`    012 456`'} ]  ,
    [ {}  , '|012 456'       , '<Control>['  , '0'            , 'indentLeft'                                 , {rawTexts: '012 456'} ]     ,
    [ {}  , ' |012 456'      , '<Control>['  , '0'            , 'indentLeft'                                 , {rawTexts: '012 456'} ]     ,
    [ {}  , '|012 456'       , '<Enter>'     , '0'            , 'newLine'                                    , {rawLines: '1'              , rawTexts: '012 456'} ]       ,
    [ {}  , '01|2 456'       , '<Enter>'     , '0'            , 'newLine'                                    , {rawLines: '1'              , rawTexts: '2 456'            , previousText: '01'} ]    ,
    [ {}  , '01|2 456\nabc'  , '<Enter>'     , '0'            , 'newLine'                                    , {rawLines: '1'              , rawTexts: '2 456'            , previousText: '01'       , numOfLines: 3} ]  ,
    [ {}  , '012 456|'       , '<Enter>'     , '0'            , 'newLine'                                    , {rawLines: '1'              , rawTexts: ''                 , previousText: '012 456'  , numOfLines: 2} ]  ,
    [ {}  , ''               , '<Escape>'    , '0'            , 'enterNormalMode'                            , {mode: VimMode.INSERT} ]    ,
    [ {}  , ''               , '<Escape>'    , '0'            , 'enterNormalMode'                            , {mode: VimMode.VISUAL} ]    ,
    //    , 'rawContent'     , 'rawInput'    , 'rawCommands'  , 'rawColumns'                                 ,
];
// [ {}  , 'hi\n012 456|'   , 'ku'        , '1'            , 'cursorUp'                                   , {rawTexts: 'hi' }]         , // @todo eeku should leave cursor at last position of below line
// [ {focus:true}  , '    |012 456'       , '<Control>['   , '0'            , 'indentLeft'                                    , {rawTexts: '012 456'} ]    ,

describe('Vim input.', () => {
  const focussedTestCases = testCaseAsList.filter(
    (testCase) => testCase[0].focus
  );

  if (focussedTestCases.length > 0) {
    testCaseAsList = focussedTestCases;
  }

  testCaseAsList.forEach(
    ([
      _testCaseOptions,
      rawContent,
      rawInput,
      rawColumns,
      rawCommands,
      moreAssertions = {},
    ]) => {
      const {
        expectedMode,
        mode,
        numOfLines,
        previousText,
        rawLines,
        rawTexts,
      } = moreAssertions;
      const finalMode = mode ?? VimMode.NORMAL;
      describe(`Letter - ${rawInput[0]}.`, () => {
        describe(`${rawInput} - ${rawCommands}.`, () => {
          it(`Given I activate Vim with the following input: "${rawContent}"`, () => {
            const rawInput = rawContent.split('\n');
            const input = replaceCursorFromRaw(rawInput);

            // If we provide rawContent, then also a cursor
            if (rawContent) {
              initialCursor = findCursor(rawInput);
              vim = new Vim(cloneDeep(input), initialCursor);
            } else {
              vim = new Vim(cloneDeep(input));
            }
          });

          it(`And I'm in "${finalMode}" mode.`, () => {
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

          it(`When I type "${rawInput}"`, () => {
            const input = GherkinTestUtil.replaceQuotes(rawInput);

            manyQueuedInput = vim.queueInputSequence(input);
          });

          it(`Then the expected commands should be "${rawCommands}"`, () => {
            const conmmands = rawCommands.split(RAW_SPLIT);
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
            it(`there should be "${numOfLines}" lines`, () => {
              expect(
                manyQueuedInput[manyQueuedInput.length - 1].lines.length
              ).toBe(Number(numOfLines), 'hi');
            });
          }

          it(`And the cursors should be at line "${
            rawLines ?? 0
          }" and column "${rawColumns}"`, () => {
            const columns = rawColumns.split(RAW_SPLIT);
            expect(columns.length).toBe(manyQueuedInput.length);

            let expectedColumn;
            columns.forEach((column, index) => {
              expectedColumn = memoizeExpected(column, expectedColumn);

              expect(manyQueuedInput[index].vimState.cursor.col).toEqual(
                Number(expectedColumn),
                `Expected equal number of columns and result. Test index: ${index}`
              );
            });

            if (!(rawLines ?? '')) return;

            const lines = rawLines.split(RAW_SPLIT);
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
            it(`And the texts should be "${rawTexts}"`, () => {
              const rawTextsSplit = rawTexts.split(RAW_SPLIT);

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
            it(`And the previous line text should be "${previousText}"`, () => {
              const previousLine =
                manyQueuedInput[manyQueuedInput.length - 1].lines[
                  initialCursor.line
                ];
              expect(previousLine).toBe(previousText);
            });
          }

          // Modes
          if (expectedMode !== undefined) {
            it(`And I should go into "${expectedMode}" mode`, () => {
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
  let cursorLine: number | undefined;
  let cursorColumn: number | undefined;
  input.forEach((line, index) => {
    const matchedCursor = matchCursor(line);
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
  const command = GherkinTestUtil.replaceQuotes(rawCommand) as VIM_COMMAND;

  verifyCommandsName(command);

  expect(expectedInput.targetCommand).toBe(command);
}

/**
 * Better DX: allow sth like "foo;;,bar"
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

function verifyCommandsName(command: VIM_COMMAND) {
  const isValid = VIM_COMMANDS.includes(command);

  if (!isValid) {
    // testError.log(`Command not in list, was: >> ${command} <<.`);
    throw new TestError(`Command not in list, was: >> ${command} <<.`);
  }

  return true;
}
