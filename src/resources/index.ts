import { FrameworkConfiguration, PLATFORM } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./elements/highlightCode/highlightCode'),
    PLATFORM.moduleName('./attributes/highlight'),
  ]);
}
