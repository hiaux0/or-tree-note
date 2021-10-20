import { Container } from 'aurelia-dependency-injection';
import { loadFeatures, autoBindSteps } from 'jest-cucumber';
import { commonNormalModeSteps } from './step-definitions/common-steps/modes/common-normal-mode.spec';
import { commonVimSteps } from './step-definitions/common-steps/modes/common-vim.spec';
import { chaningModesSteps } from './step-definitions/modes/changing-modes.spec';
import { normalModeSteps } from './step-definitions/modes/normal/normal-mode.spec';

export const testContainer = new Container();

export function initCucumberTests(tagFilter: string = '@focus') {
  const features = loadFeatures('**/features/**/*.feature', {
    tagFilter,
  });

  autoBindSteps(features, [
    chaningModesSteps,
    // common
    commonNormalModeSteps,
    commonVimSteps,
    // modes
    normalModeSteps,
  ]);
}
