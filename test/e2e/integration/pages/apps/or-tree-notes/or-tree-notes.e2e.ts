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

  it("Should write text", () => {
    let beforeContent: string;

    cy.get(".editor-line")
      .invoke("text")
      .then((lineTextContent) => {
        beforeContent = lineTextContent;
      });

    cy.main().type("i@");

    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`@${beforeContent}`);
      });
  });
});
