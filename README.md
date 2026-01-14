# axe-cypress-a11y

```bash
Provides a chainable axe API for CypressIO.
```

Automated accessibility testing builder for Cypress powered by [axe-core®](https://github.com/dequelabs/axe-core), following the same patterns as other `@axe-core/xyz` packages developed by [Deque Systems, Inc](https://www.deque.com/). axe®, and axe-core® are [trademarks of Deque Systems, Inc](https://www.deque.com/legal/trademarks/). Click to find out more detaila about [Axe tools](https://www.deque.com/axe/).

## Getting Started

Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if you haven't already.

Install Cypress: `npm install cypress `

Install @axe-core/cypress: `npm install axe-core axe-cypress-a11y`

## Usage

This module uses a chainable API to assist in injecting, configuring, and analyzing axe with [Cypress](https://www.cypress.io/).

Here is an example of a script that will drive Cypress to a page, perform an analysis, and then log results.

```typescript
import AxeBuilder from 'axe-cypress-a11y';

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', () => {
    cy.visit('/');
    
    new AxeBuilder()
      .include('.main-content')
      .exclude('.ads')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
      .then((results) => {
       cy.log(`Violations: ${JSON.stringify(results.violations, null, 2)}`);
      });
  });
});

```

## API

### `new AxeBuilder()`

Creates a new AxeBuilder instance.

### `.include(selector: string)`

Add a CSS selector to include in the analysis.

### `.exclude(selector: string)`

Add a CSS selector to exclude from the analysis.

### `.withTags(tags: string | string[])`

Limit analysis to rules with specific tags (e.g., 'wcag2a', 'wcag2aa', 'wcag21a').

### `.withRules(rules: string | string[])`

Limit analysis to specific rule IDs.

### `.disableRules(rules: string | string[])`

Disable specific rules from the analysis.

### `.options(options: RunOptions)`

Pass custom options to axe.run().

### `.configure(config: Spec)`

Configure axe with custom settings.

### `.analyze()`

Run the accessibility analysis and return results.

## Examples

### Basic Usage

```typescript
new AxeBuilder()
  .analyze()
  .then((results) => {
    cy.log(`Found ${results.violations.length} violations`);
  });

```

### With Specific Tags

```typescript
new AxeBuilder()
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze()
  .then((results) => {
    expect(results.violations).to.have.length(0);
  });

```

### Exclude Elements

```typescript
new AxeBuilder()
  .exclude('.third-party-widget')
  .exclude('#ads')
  .analyze()
  .then((results) => {
    expect(results.violations).to.have.length(0);
  });

```

### Custom Configuration

```typescript
new AxeBuilder()
  .configure({
    rules: [{
      id: 'color-contrast',
      enabled: false
    }]
  })
  .analyze();

```

## License

MIT