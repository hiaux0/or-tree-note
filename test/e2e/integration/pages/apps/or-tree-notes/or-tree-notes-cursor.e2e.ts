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
  const input1 = "eh";
  it(`DEV: ${input1}`, () => {
    cy.vim(input1);
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", caretWidth * 8);
    });
  });
  const input2 = "ee";
  it.skip(`DEV: ${input2}`, () => {
    cy.vim(input2);
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", caretWidth * 16);
    });
  });
  const input3 = "eee";
  it(`DEV: ${input3}`, () => {
    cy.vim(input3);
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", caretWidth * 16);
    });
  });
});
