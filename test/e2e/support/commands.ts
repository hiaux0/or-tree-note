/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// tag is '%'
const markedTestTag = /%([A-Z_a-z-]+)/g;
const enableLogging = true;

// replace tagging with [data-test=xy]
export const normalizeSelector = (selector: unknown): unknown =>
  typeof selector === 'string'
    ? selector.replace(markedTestTag, '[data-test=$1]')
    : selector;

/*
 * allow tagging data-test attributes with % as selector
 */

//  https://docs.cypress.io/api/cypress-api/custom-commands.html#Parent-Commands
['get'].forEach((cmd) => {
  Cypress.Commands.overwrite(cmd, (fn, selector, ...rest) => {
    if (enableLogging || rest[0]?.log === true) {
      return fn(normalizeSelector(selector), ...rest);
    } else {
      return fn(normalizeSelector(selector), { ...rest, log: false });
    }
  });
});

// https://docs.cypress.io/api/cypress-api/custom-commands.html#Dual-Commands
['contains'].forEach((cmd) => {
  Cypress.Commands.overwrite(cmd, (fn, element, selector, content) => {
    if (enableLogging) {
      if (content === undefined) {
        // cy.contains('Hello')
        content = selector;
        return fn(element, content);
      }
      // Eg. cy.contains('ul', 'apples')
      return fn(element, normalizeSelector(selector), content);
    }

    if (content === undefined) {
      content = selector;
      // cy.contains('Hello', {})
      return fn(element, content, { log: false });
    }
    // Eg. cy.contains('ul', 'apples', {})
    return fn(element, normalizeSelector(selector), content, { log: false });
  });
});

// https://docs.cypress.io/api/cypress-api/custom-commands.html#Child-Commands
[
  'children',
  'closest',
  'filter',
  'find',
  'next',
  'nextAll',
  'nextUntil',
  'not',
  'parent',
  'parents',
  'prev',
  'prevAll',
  'prevUntil',
  'siblings',
].forEach((cmd) => {
  Cypress.Commands.overwrite(cmd, (fn, element, selector, ...rest) => {
    if (enableLogging) {
      return fn(element, normalizeSelector(selector), ...rest);
    }
    return fn(element, normalizeSelector(selector), { ...rest, log: false });
  });
});
