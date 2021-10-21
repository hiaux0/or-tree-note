import { StepDefinitions } from 'jest-cucumber';
import {
  VimCommandNames,
  VIM_COMMANDS,
} from 'modules/vim/vim-commands-repository';
import { QueueInputReturn } from 'modules/vim/vim.types';
import {
  TestError,
  testError,
} from '../../../../common-test/errors/test-errors';
import { GherkinTestUtil } from '../../../../common-test/gherkin/gherkin-test-util';
import { vim } from '../../common-steps/modes/common-vim.spec';

let queuedInput: QueueInputReturn;
let manyQueuedInput: QueueInputReturn[];

export const normalModeSteps: StepDefinitions = ({ when, then, and }) => {
  when(/^I queueInput (.*)$/, (rawInput: string) => {
    const input = GherkinTestUtil.replaceQuotes(rawInput); /*?*/
    queuedInput = vim.queueInput(input);
  });

  when(/^I queueInputSequence (.*)$/, (rawInput: string) => {
    const input = GherkinTestUtil.replaceQuotes(rawInput);

    manyQueuedInput = vim.queueInputSequence(input);
    // manyQueuedInput; /*?*/
  });

  then(
    /^the expected command should be (.*)$/,
    (rawCommand: VimCommandNames) => {
      theExpectedCommandShouldBe(queuedInput, rawCommand);
    }
  );

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

  and(/^the cursor should be at line (.*) and column (.*)$/, (line, column) => {
    expect(queuedInput.vimState.cursor).toEqual({
      col: Number(column),
      line: Number(line),
    });
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
          'Expected equal number of columns and result'
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
    rawTextsSplit; /*?*/

    let lastExpectedText = '';
    rawTextsSplit.forEach((rawText, index) => {
      const text = GherkinTestUtil.replaceQuotes(rawText);
      lastExpectedText = memoizeExpected(text, lastExpectedText);

      expect(manyQueuedInput[index].vimState.text).toBe(lastExpectedText);
    });
  });
};

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
