import { sendKeyEvent } from "../../../../../../src/modules/keys/keys";

describe("Aurelia skeleton app", () => {
  beforeEach(() => {
    cy.visit("#/apps");
  });

  it("should display greeting", () => {
    // cy.get('[aurelia-app="main"]').type("l");
    cy.main().type("l");
  });
});
