declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
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
    name: "main",
  });
  return cy.get('[aurelia-app="main"]');
}
Cypress.Commands.add("main", main);

export {};
