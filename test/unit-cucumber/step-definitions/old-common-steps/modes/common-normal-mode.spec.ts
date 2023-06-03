import { StepDefinitions } from 'jest-cucumber';

import { VimMode, VimModeKeys } from '../../../../../src/modules/vim/vim-types';
import { TestError } from '../../../../common-test/errors/test-errors';
import { vim } from './common-vim.spec';

export const commonModeSteps: StepDefinitions = ({ given, then }) => {
  given(/^I'm in (.*) mode.$/, (mode: VimModeKeys) => {
    switch (mode.toLowerCase()) {
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

  then(/^the I should go into (.*) mode$/, (mode: VimModeKeys) => {
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
};
