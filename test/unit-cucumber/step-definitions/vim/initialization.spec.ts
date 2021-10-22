import { StepDefinitions } from 'jest-cucumber';
import { vim } from '../common-steps/modes/common-vim.spec';

export const initializationSteps: StepDefinitions = ({ then, and }) => {
  then(
    /the cursor position should be in line (.*) and column (.*)$/,
    (line, column) => {
      expect(vim.vimState.cursor.line).toBe(Number(line));
      expect(vim.vimState.cursor.col).toBe(Number(column));
    }
  );

  and(/the lines should be (.*)/, () => {
    expect(vim.vimState.lines).toEqual(['012', '456', '789']);
  });
};
