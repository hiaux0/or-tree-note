describe("Aurelia skeleton app", () => {
  let initialContent: string;

  beforeEach(() => {
    cy.visit("#/apps");

    cy.get(".editor-line")
      .invoke("text")
      .then((lineTextContent) => {
        initialContent = lineTextContent;
      });
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
    cy.main().type("i@");

    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`@${initialContent}`);
      });
  });

  it.only("Dev: Escape in insert mode should not print escape", () => {
    cy.main().type("i{esc}");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(initialContent);
      });
  });
  it.skip("Dev: Escape in insert mode, then queue key in normal should not type out", () => {
    cy.main().type("i{esc}l");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(initialContent);
      });
  });
});
