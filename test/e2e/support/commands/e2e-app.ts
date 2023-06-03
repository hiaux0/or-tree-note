declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * @example
       *   cy.main()
       */
      main: typeof main;
    }
  }
}
function main() {
  Cypress.log({
    name: 'main',
  });
  return cy.get('[aurelia-app="main"]');
}
Cypress.Commands.add('main', main);

export {};
