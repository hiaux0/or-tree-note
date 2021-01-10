declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
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
    name: "vim",
  });
  cy.main().type(input);
}
Cypress.Commands.add("vim", vim);

export {};
