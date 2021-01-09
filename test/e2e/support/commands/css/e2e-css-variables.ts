import { getCssVar as getCssVarModule } from "src/modules/css/css-variables";

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * @example
       *   cy.getCssVar()
       */
      getCssVar: typeof getCssVar;
    }
  }
}
function getCssVar(varName: string, isPixel = true) {
  Cypress.log({
    name: "getCssVar",
  });

  return cy.document().then((document) => {
    const cssVar = getCssVarModule(varName, isPixel, document.body);
    return cy.wrap(cssVar);
  });
}
Cypress.Commands.add("getCssVar", getCssVar);

export {};
