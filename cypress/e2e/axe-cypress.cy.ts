/// <reference types="cypress" />
import AxeBuilder from '../../dist/index.js';

describe('AxeBuilder', () => {
    it('should run accessibility checks on the page', () => {
        cy.visit('https://v0-next-js-ecom-site.vercel.app/'); // Example page

        new AxeBuilder()
            .include('body')
            .exclude('#menu-panel')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
            .analyze()
            .then(results => {
                cy.log(`${results.violations.length} Violations found`);
                cy.log(`Violations: ${JSON.stringify(results.violations, null, 2)}`);
            });
    });
});