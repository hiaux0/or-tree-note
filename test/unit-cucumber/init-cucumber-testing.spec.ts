import { Container } from 'aurelia-dependency-injection';
import { loadFeatures, autoBindSteps } from 'jest-cucumber';
import { commonVimAssertionsSteps } from './step-definitions/common-steps/common-vim-assertions.spec';
import { commonModeSteps } from './step-definitions/common-steps/modes/common-normal-mode.spec';
import { commonVimSteps } from './step-definitions/common-steps/modes/common-vim.spec';
import { normalModeSteps } from './step-definitions/modes/normal/normal-mode.spec';
import { initializationSteps } from './step-definitions/vim/initialization.spec';

export const testContainer = new Container();

export function initCucumberTests(tagFilter: string = '@focus') {
  const features = loadFeatures('**/features/**/*.feature', {
    // tagFilter,
  });

  autoBindSteps(features, [
    // common
    commonModeSteps,
    commonVimSteps,
    commonVimAssertionsSteps,
    // vim
    initializationSteps,
    // modes
    normalModeSteps,
  ]);
}
