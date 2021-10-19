import { StepDefinitions } from 'jest-cucumber';
import { cloneDeep } from 'lodash';
import { Cursor } from '../../../../src/modules/vim/vim.types';
import { Vim } from '../../../../src/modules/vim/vim';

export const chaningModesSteps: StepDefinitions = ({
  given,
  when,
  then,
  and,
}) => {
  let vim: Vim;
  const input = ['foo'];
  const cursor: Cursor = { line: 0, col: 0 };

  given('I have the following content', () => {
    vim = new Vim(cloneDeep(input), cloneDeep(cursor));

    // expect(true).toBe(false);
  });

  and('I start in the Insert', () => {
    vim.enterInsertMode();
  });

  when('I press Escape', () => {
    const result = vim.queueInput('<escape>');
    result; /*?*/
  });

  then('the content did not changed', () => {
    expect(true).toBeFalsy();
  });
};
