import { StepDefinitions } from 'jest-cucumber';
import { cloneDeep } from 'lodash';
import { Vim } from 'modules/vim/vim';
import { Cursor } from 'modules/vim/vim.types';
import { vim } from './common-vim.spec';

const input = ['foo'];

export const commonNormalModeSteps: StepDefinitions = ({ given }) => {
  given("I'm in normal mode.", () => {
    vim.enterNormalMode();
  });
};
