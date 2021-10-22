import { StepDefinitions } from 'jest-cucumber';
import { cloneDeep } from 'lodash';
import { Vim } from 'modules/vim/vim';
import { Cursor, QueueInputReturn } from 'modules/vim/vim.types';
import { testError } from '../../../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../../../common-test/gherkin/gherkin-test-util';

export let vim: Vim;
export let initialCursor;
export let manyQueuedInput: QueueInputReturn[];

export const commonVimSteps: StepDefinitions = ({ given, when }) => {
  given('I start Vim', () => {
    vim = new Vim(cloneDeep(['']));
  });

  given('I activate Vim with the following input:', (rawContent: string) => {
    const rawInput = rawContent.split('\n');
    initialCursor = findCursor(rawInput);

    const input = replaceCursorFromRaw(rawInput);
    vim = new Vim(cloneDeep(input), cloneDeep(initialCursor));
  });

  when(/^I (?:queueInputSequence|type) (.*)$/, (rawInput: string) => {
    const input = GherkinTestUtil.replaceQuotes(rawInput);

    manyQueuedInput = vim.queueInputSequence(input);
    // manyQueuedInput; /*?*/
  });
};

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

    cursorColumn = matchedCursor.index;
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
