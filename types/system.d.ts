declare module 'system' {
  import * as Aurelia from 'aurelia-framework';
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  import fetch = require('isomorphic-fetch');

  /*
   * List your dynamically imported modules to get typing support
   */
  interface System {
    import(name: string): Promise<unknown>;
    import(name: 'aurelia-framework'): Promise<typeof Aurelia>;
    import(name: 'isomorphic-fetch'): Promise<typeof fetch>;
  }

  global {
    // eslint-disable-next-line no-var
    var System: System;
  }
}
