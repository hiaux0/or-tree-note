describe("Aurelia skeleton app", () => {
  beforeEach(() => {
    cy.visit("#/apps");
  });

  it("Should move cursor", () => {
    cy.get("%caret")
      .should("exist")
      .invoke("attr", "style")
      .should("be.undefined");

    cy.main().type("l");

    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke("attr", "style")
        .should("contain", caretWidth);
    });
  });

  it.only("Should write text", () => {
    cy.main().type("i@");
  });
});
