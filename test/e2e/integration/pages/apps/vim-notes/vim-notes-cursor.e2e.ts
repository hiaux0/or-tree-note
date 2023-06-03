import { OTN_STATE_KEY } from 'src/local-storage';

const initialContent = '012 456';

describe('Aurelia skeleton app', () => {

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
    cy.visit('#/apps');
  });

  const input = 'e';
  it(`DEV: ${input}`, () => {
    cy.vim(input);
    cy.getCssVar('--caret-size-width').then((caretWidth) => {
      cy.get('%caret')
        .should('exist')
        .invoke({ timeout: 100 }, 'attr', 'style')
        .should('contain', caretWidth * 2);
    });
  });
  const input1 = 'eh';
  it(`DEV: ${input1}`, () => {
    cy.vim(input1);
    cy.getCssVar('--caret-size-width').then((caretWidth) => {
      cy.get('%caret')
        .should('exist')
        .invoke({ timeout: 100 }, 'attr', 'style')
        .should('contain', caretWidth * 1);
    });
  });
  const input2 = 'ee';
  it(`DEV: ${input2}`, () => {
    cy.vim(input2);
    cy.getCssVar('--caret-size-width').then((caretWidth) => {
      cy.get('%caret')
        .should('exist')
        .invoke({ timeout: 100 }, 'attr', 'style')
        .should('contain', (caretWidth * 6).toFixed(1));
    });
  });
  const input3 = 'eee';
  it(`DEV: ${input3}`, () => {
    cy.vim(input3);
    cy.getCssVar('--caret-size-width').then((caretWidth) => {
      cy.get('%caret')
        .should('exist')
        .invoke({ timeout: 100 }, 'attr', 'style')
        .should('contain', (caretWidth * 6).toFixed(1));
    });
  });
});
