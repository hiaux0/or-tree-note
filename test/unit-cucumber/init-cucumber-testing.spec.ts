import { Container } from 'aurelia-dependency-injection';
import { loadFeatures, autoBindSteps } from 'jest-cucumber';
import { chaningModesSteps } from './step-definitions/modes/Changing-modes.step';

export const testContainer = new Container();

export function initCucumberTests(tagFilter: string = '@focus') {
  const features = loadFeatures('**/features/**/*.feature', {
    tagFilter,
  });

  autoBindSteps(features, [chaningModesSteps]);
}
