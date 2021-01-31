import { Logger } from 'modules/debug/logger';
import { rootContainer } from 'modules/root-container';

const logger = new Logger({ scope: 'ChildrenMutationObserver' });

export class ChildrenMutationObserver {
  private observer: MutationObserver;

  constructor() {}

  createObserver(targetElement: HTMLElement, afterObserved: () => void) {
    // Callback function to execute when mutations are observed
    const callback: MutationCallback = (mutationsList) => {
      // Use traditional 'for loops' for IE 11
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          /**
           * ASSUMPTION: Only care for added nodes
           */
          if (mutation.removedNodes.length > 0) return;

          logger.debug(['A child node has been added or removed.']);
          afterObserved();
        }
      }
    };

    // Create an observer instance linked to the callback function
    if (!this.observer) {
      this.observer = new MutationObserver(callback);
    }

    // Options for the observer (which mutations to observe)
    const config: MutationObserverInit = { childList: true, subtree: true };
    // Start observing the target node for configured mutations
    this.observer.observe(targetElement, config);
  }

  /**
   * TODO: Currently not used, do we need?
   */
  // disconnect() {
  //   this.observer.disconnect();
  // }
}

rootContainer.registerSingleton(ChildrenMutationObserver);
