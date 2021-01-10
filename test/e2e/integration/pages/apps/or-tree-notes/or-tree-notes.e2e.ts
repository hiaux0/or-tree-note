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

    cy.vim("l");

    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke("attr", "style")
        .should("contain", caretWidth);
    });
  });

  it("Should write text", () => {
    cy.vim("i@");

    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`@${initialContent}`);
      });
  });

  it("Dev: Escape in insert mode should not print escape", () => {
    cy.vim("i{esc}");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(initialContent);
      });
  });
  it("Dev: Escape in insert mode, then queue key in normal should not type out", () => {
    cy.vim("i{esc}l");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(initialContent);
      });
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke("attr", "style")
        .should("contain", caretWidth);
    });
  });

  it("DEV: il<esc>l", () => {
    cy.vim("il{esc}ll");
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", Math.round(caretWidth * 3));
    });
  });
  it("DEV: i{shift}", () => {
    cy.vim("i{shift}");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(initialContent);
      });
  });
  it.only("DEV: i^{esc}", () => {
    cy.vim("i^{esc}l");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`^${initialContent}`);
      });
  });
});
