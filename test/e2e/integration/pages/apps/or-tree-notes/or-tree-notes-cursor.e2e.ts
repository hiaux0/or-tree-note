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
  const input = "e";
  it(`DEV: ${input}`, () => {
    cy.vim(input);
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", caretWidth * 9);
    });
  });
});
