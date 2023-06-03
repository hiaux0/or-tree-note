declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * @example
       *   cy.vim()
       */
      vim: typeof vim;
    }
  }
}
function vim(input: string) {
  Cypress.log({
    name: 'vim',
  });
  cy.main().type(input);
}
Cypress.Commands.add('vim', vim);

export {};
