/// <reference types="cypress" />

import type { AxeResults, Spec } from 'axe-core';
import type { AxeRunOptions, ContextObject, WindowWithAxe } from './types';
import { getAxeCorePath, isAxeInjected, injectAxeCore, normalizeSelector } from './utils';

/**
 * AxeBuilder class for Cypress
 * Provides a chainable API to configure and run axe-core accessibility tests
 */
export class AxeBuilder {
  private _includes: string[] = [];
  private _excludes: string[] = [];
  private _options: AxeRunOptions = {};

  constructor() {}

  /**
   * Add a CSS selector to the list of elements to include in analysis
   * @param selector - CSS selector to include
   * @returns Returns this for method chaining
   */
  include(selector: string): this {
    if (selector) {
      this._includes.push(selector);
    }
    return this;
  }

  /**
   * Add a CSS selector to the list of elements to exclude from analysis
   * @param selector - CSS selector to exclude
   * @returns Returns this for method chaining
   */
  exclude(selector: string): this {
    if (selector) {
      this._excludes.push(selector);
    }
    return this;
  }

  /**
   * Specifies options to be used by axe.run
   * Will override any other configured options, including calls to withRules() and withTags()
   * @param options - Options object to pass to axe.run
   * @returns Returns this for method chaining
   */
  options(options: AxeRunOptions): this {
    this._options = { ...this._options, ...options };
    return this;
  }

  /**
   * Limits analysis to only those with the specified rule IDs
   * Accepts a String of a single rule ID or an Array of multiple rule IDs
   * @param rules - Rule ID(s) to run
   * @returns Returns this for method chaining
   */
  withRules(rules: string | string[]): this {
    const ruleArray = normalizeSelector(rules);
    this._options.runOnly = {
      type: 'rule',
      values: ruleArray,
    };
    return this;
  }

  /**
   * Limits analysis to only those with the specified tags
   * Accepts a String of a single tag or an Array of multiple tags
   * @param tags - Tag(s) to run
   * @returns Returns this for method chaining
   */
  withTags(tags: string | string[]): this {
    const tagArray = normalizeSelector(tags);
    this._options.runOnly = {
      type: 'tag',
      values: tagArray,
    };
    return this;
  }

  /**
   * Skips verification of the rules provided
   * Accepts a String of a single rule ID or an Array of multiple rule IDs
   * @param rules - Rule ID(s) to disable
   * @returns Returns this for method chaining
   */
  disableRules(rules: string | string[]): this {
    const ruleArray = normalizeSelector(rules);
    this._options.rules = this._options.rules || {};
    ruleArray.forEach((rule) => {
      this._options.rules![rule] = { enabled: false };
    });
    return this;
  }

  /**
   * Set the frame testing method to "legacy mode"
   * In this mode, axe will not open a blank page to aggregate results
   * Use as a last resort when opening a blank page causes issues
   * @param _legacyMode - Whether to enable legacy mode (default: true)
   * @returns Returns this for method chaining
   */
  setLegacyMode(_legacyMode: boolean = true): this {
    return this;
  }

  /**
   * Configures axe with custom configuration
   * @param config - Configuration object to pass to axe.configure
   * @returns Returns this for method chaining
   */
  configure(config: Spec): Cypress.Chainable<this> {
    return cy.window({ log: false }).then((win) => {
      return this._ensureAxeInjected(win).then(() => {
        (win as unknown as WindowWithAxe).axe.configure(config);
        return this;
      });
    });
  }

  /**
   * Performs analysis and returns results
   * @returns Cypress chainable with axe results
   */
  analyze(): Cypress.Chainable<AxeResults> {
    return cy.window({ log: false }).then((win) => {
      return this._ensureAxeInjected(win).then(() => {
        const context = this._buildContext();
        const { interval, retries, ...axeOptions } = this._options;
        let remainingRetries = retries || 0;

        const runAxeCheck = (): Promise<AxeResults> => {
          return (win as unknown as WindowWithAxe).axe
            .run(context || win.document, axeOptions)
            .then((results: AxeResults) => {
              if (results.violations.length > 0 && remainingRetries > 0) {
                remainingRetries--;
                return new Promise<AxeResults>((resolve) => {
                  setTimeout(() => resolve(runAxeCheck()), interval || 1000);
                });
              }
              return results;
            });
        };

        return runAxeCheck();
      });
    });
  }

  /**
   * Internal method to ensure axe-core is injected into the page
   * @private
   * @param win - The window object
   * @returns Promise that resolves when axe is ready
   */
  private _ensureAxeInjected(win: Window): Cypress.Chainable<void> {
    // Check if axe is already loaded
    if (isAxeInjected(win)) {
      return cy.then(() => {}) as Cypress.Chainable<void>;
    }

    // Read and inject axe-core
    const axePath = getAxeCorePath();

    return cy.readFile(axePath, { log: false }).then((source: string) => {
      injectAxeCore(win, source);
    }) as Cypress.Chainable<void>;
  }

  /**
   * Internal method to build the context object for axe.run
   * @private
   * @returns Context object or undefined
   */
  private _buildContext(): ContextObject | undefined {
    const hasIncludes = this._includes.length > 0;
    const hasExcludes = this._excludes.length > 0;

    if (!hasIncludes && !hasExcludes) {
      return undefined;
    }

    const context: ContextObject = {};
    if (hasIncludes) {
      context.include = this._includes;
    }
    if (hasExcludes) {
      context.exclude = this._excludes;
    }

    return context;
  }
}

// Export for direct usage
export default AxeBuilder;

// Export types for consumers
export type { AxeBuilderOptions, ContextObject, AxeRunOptions } from './types';