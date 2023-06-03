import { StepDefinitions } from 'jest-cucumber';
import { cloneDeep } from 'lodash';

import { VimCore } from '../../../../../src/modules/vim/vim-core';
import {
  Cursor,
  QueueInputReturn,
} from '../../../../../src/modules/vim/vim-types';
import { testError } from '../../../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../../../common-test/gherkin/gherkin-test-util';

// eslint-disable-next-line import/no-mutable-exports
export let vim: VimCore;
// eslint-disable-next-line import/no-mutable-exports
export let initialCursor: Cursor;
// eslint-disable-next-line import/no-mutable-exports
export let manyQueuedInput: QueueInputReturn[];

export const commonVimSteps: StepDefinitions = ({ given, when }) => {
  given('I start Vim', () => {
    vim = new VimCore(cloneDeep([{ text: '' }]));
  });

  given('I activate Vim with the following input:', (rawContent: string) => {
    const rawInput = rawContent.split('\n');
    initialCursor = findCursor(rawInput);

    const input = cleanupRaw(rawInput).map((t) => ({ text: t }));
    vim = new VimCore(cloneDeep(input), cloneDeep(initialCursor));
  });

  when(/^I (?:queueInputSequence|type) (.*)$/, async (rawInput: string) => {
    const input = GherkinTestUtil.replaceQuotes(rawInput);

    manyQueuedInput = await vim.queueInputSequence(input);
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
  let cursorLine = NaN;
  let cursorColumn = NaN;
  input.forEach((line, index) => {
    const matchedCursor = matchCursor(line);
    if (matchedCursor === null) return;
    if (cursorLine !== undefined && cursorColumn !== undefined) {
      /* prettier-ignore */ logAlreadyFoundCursorError(cursorLine, cursorColumn, index, matchedCursor);
    }

    /* prettier-ignore */
    if (matchedCursor[0] === '|') {
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

function cleanupRaw(rawInput: string[]) {
  const result = rawInput.map((line) => {
    line = GherkinTestUtil.replaceQuotes(line);

    const isCursorMatch = matchCursor(line);
    if (isCursorMatch) {
      const [cursorChar] = isCursorMatch;
      return line.replace(cursorChar, '');
    }

    return line;
  });
  return result;
}
