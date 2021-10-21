import { StepDefinitions } from 'jest-cucumber';
import { VimModeKeys } from 'modules/vim/vim.types';
import { TestError } from '../../../../common-test/errors/test-errors';
import { vim } from './common-vim.spec';

const input = ['foo'];

export const commonNormalModeSteps: StepDefinitions = ({ given }) => {
  given(/^I'm in (.*) mode.$/, (mode: VimModeKeys) => {
    switch (mode.toLowerCase()) {
      case 'insert': {
        vim.enterInsertMode();
        break;
      }
      case 'normal': {
        vim.enterNormalMode();
        break;
      }
      default: {
        throw new TestError('Not valid/supported mode');
      }
    }
  });
};
