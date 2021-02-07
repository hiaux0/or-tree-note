import { CSS_SELECTORS } from 'src/common/css-selectors';
import { OTN_STATE } from 'src/local-storage';
import { VimEditorState } from 'src/store/initial-state';

const initialContent = '012 456';
const secondContent = 'abcdef 89';

describe('VimEditor - Visual', () => {
  context('Visual - 1 line', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        const initialTestState: VimEditorState = {
          lines: [{ text: initialContent }],
          vimState: {
            text: initialContent,
            cursor: { col: 2, line: 0 },
            mode: 'NORMAL',
          },
        };
        window.localStorage.setItem(
          OTN_STATE,
          JSON.stringify(initialTestState)
        );
      });
      cy.visit('#/apps');
    });

    it('Start visual - v', () => {
      cy.vim('v');

      cy.getCssVar('--caret-size-width').then((caretWidth) => {
        cy.contains('div', initialContent)
          .siblings('.editorLine__highlight')
          .invoke('attr', 'style')
          .should('contain', `left: ${caretWidth * 2}px`)
          .should('contain', `width: ${caretWidth * 1}px`);
      });
    });
    it('Visual - vl', () => {
      cy.vim('vl');

      cy.getCssVar('--caret-size-width').then((caretWidth) => {
        cy.contains('div', initialContent)
          .siblings('.editorLine__highlight')
          .invoke('attr', 'style')
          .should('contain', `left: ${caretWidth * 2}px`)
          .should('contain', `width: ${caretWidth * 2}px`);
      });
    });
    it('Visual - vh', () => {
      cy.vim('vh');

      cy.getCssVar('--caret-size-width').then((caretWidth) => {
        cy.contains('div', initialContent)
          .siblings('.editorLine__highlight')
          .invoke('attr', 'style')
          .should('contain', `left: ${caretWidth * 1}px`)
          .should('contain', `width: ${caretWidth * 2}px`);
      });
    });
  });

  context.only('Visual - Multi line', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        const initialTestState: VimEditorState = {
          lines: [
            { text: initialContent, macro: { checkbox: { value: true } } },
            { text: secondContent },
          ],
          vimState: {
            text: initialContent,
            cursor: { col: 2, line: 0 },
            mode: 'NORMAL',
          },
        };

        window.localStorage.setItem(
          OTN_STATE,
          JSON.stringify(initialTestState)
        );
      });
      cy.visit('#/apps');
    });

    context('Visual - Visual only in active line', () => {
      it('Highlight should only appear in current line', () => {
        cy.vim('v');

        cy.get('.editorLine__highlight').should('have.length', 1);
      });
    });
    context('Visual - Line with checkbox', () => {
      it('Highlight should be offset correctly', () => {
        cy.vim('v');

        cy.get('.editorLine__highlight').should('have.length', 1);

        cy.getCssVar('--caret-size-width').then((caretWidth) => {
          cy.get(`%${CSS_SELECTORS['editor-line']}`).then((editorLine) => {
            const offsetLeft = editorLine[0].offsetLeft;

            cy.get(`%${CSS_SELECTORS['editor-line']}`)
              .siblings('.editorLine__highlight')
              .invoke('attr', 'style')
              .should('contain', `left: ${(caretWidth * 2) + offsetLeft}px`)
              .should('contain', `width: ${caretWidth * 1}px`);
          });
        });
      });
    });
  });
});
