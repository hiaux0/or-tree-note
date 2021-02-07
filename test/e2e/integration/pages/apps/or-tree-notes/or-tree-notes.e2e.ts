import { OTN_STATE_KEY } from "src/local-storage";

const initialContent = "012 456";

describe("Aurelia skeleton app", () => {
  beforeEach(() => {
    cy.window().then((window) => {
      const initialTestState = JSON.stringify({
        lines: [
          {
            text: initialContent,
          },
        ],
      });
      window.localStorage.setItem(OTN_STATE_KEY, initialTestState);
    });
    cy.visit("#/apps");
  });

  it("Should move cursor", () => {
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
  it("DEV: i^{esc}", () => {
    cy.vim("i^{esc}l");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`^${initialContent}`);
      });
  });
  it("DEV: iAB{esc}", () => {
    cy.vim("iAB{esc}");
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`AB${initialContent}`);
      });
  });
  const input = "iA{esc}";
  it(`DEV: ${input}`, () => {
    cy.vim(input);
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`A${initialContent}`);
      });
  });
  const input1 = "iABCDEF{esc}";
  it(`DEV: ${input1}`, () => {
    cy.vim(input1);
    cy.get(".editor-line")
      .invoke("text")
      .then((updatedContent) => {
        expect(updatedContent).equal(`ABCDEF${initialContent}`);
      });
  });

  const input2 = `i^{esc}${"l".repeat(initialContent.length + 1)}`;
  it(`DEV (stay inside right border after text): ${input2}`, () => {
    cy.vim(input2);
    cy.getCssVar("--caret-size-width").then((caretWidth) => {
      cy.get("%caret")
        .should("exist")
        .invoke({ timeout: 100 }, "attr", "style")
        .should("contain", caretWidth * (initialContent.length + 1));
    });
  });
});
