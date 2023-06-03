import { CSS_SELECTORS } from '../../../../../../../src/common/css-selectors';
import { OTN_STATE_KEY } from '../../../../../../../src/local-storage';

const firstLine = '012 456';
const secondLine = '0ab def';

describe('[abstract-text-mode] Commands', () => {
  beforeEach(() => {
    cy.window().then((window) => {
      const initialTestState = JSON.stringify({
        lines: [
          {
            text: firstLine,
          },
          {
            text: secondLine,
          },
        ],
      });
      window.localStorage.setItem(OTN_STATE_KEY, initialTestState);
    });
    cy.visit('#/apps');
  });

  context('#newLine', () => {
    it('Add new line between lines', () => {
      cy.vim('{Enter}');
      cy.get(`%${CSS_SELECTORS['editor-line']}`).should('have.length', 3);
    });

    it('Add new line at the end', () => {
      cy.vim('u{Enter}');
      cy.get(`%${CSS_SELECTORS['editor-line']}`).should('have.length', 3);
    });
  });
});
