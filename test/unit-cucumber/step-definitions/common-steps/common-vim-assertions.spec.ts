import { StepDefinitions } from 'jest-cucumber';
import {
  VimCommandNames,
  VIM_COMMANDS,
  VIM_COMMAND,
} from 'modules/vim/vim-commands-repository';
import { QueueInputReturn } from 'modules/vim/vim-types';

import { testError, TestError } from '../../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../../common-test/gherkin/gherkin-test-util';
import { initialCursor, manyQueuedInput } from './modes/common-vim.spec';

export const commonVimAssertionsSteps: StepDefinitions = ({ then, and }) => {
  /** command1,command2 */
  then(
    /^the expected commands should be (.*)$/,
    // TODO: verify spelling

    (rawCommands: VimCommandNames) => {
      const conmmands = rawCommands.split(',');
      expect(conmmands.length).toBe(
        manyQueuedInput.length,
        'Expected equal commands of lines and result'
      );

      let expectedCommand = null;
      conmmands.forEach((command, index) => {
        expectedCommand = memoizeExpected(command, expectedCommand);

        theExpectedCommandShouldBe(manyQueuedInput[index], expectedCommand);
      });
    }
  );

  and(/^there should be (\d+) lines$/, (numOfLines: string) => {
    expect(manyQueuedInput[manyQueuedInput.length - 1].lines.length).toBe(
      Number(numOfLines)
    );
  });

  and(
    /^the cursors should be at line (.*) and column (.*)$/,
    (rawLines: string, rawColumns: string) => {
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
    }
  );

  and(/^the texts should be (.*)$/, (rawTexts: string) => {
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

  and(/^the previous line text should be (.*)$/, (previousText: string) => {
    const previousLine =
      manyQueuedInput[manyQueuedInput.length - 1].lines[initialCursor.line];
    expect(previousLine).toBe(previousText);
  });
};

function theExpectedCommandShouldBe(
  expectedInput: QueueInputReturn,
  rawCommand: string
) {
  const command = GherkinTestUtil.replaceQuotes(rawCommand) as VIM_COMMAND;

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

function verifyCommandsName(command: VIM_COMMAND) {
  const isValid = VIM_COMMANDS.includes(command);

  if (!isValid) {
    // testError.log(`Command not in list, was: >> ${command} <<.`);
    throw new TestError(`Command not in list, was: >> ${command} <<.`);
  }

  return true;
}
