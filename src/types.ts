/// <reference types="cypress" />

import type { AxeResults, RunOptions, Spec } from 'axe-core';

/**
 * Additional options specific to the Cypress AxeBuilder
 */
export interface AxeBuilderOptions {
  /**
   * Time interval between retries in milliseconds
   */
  interval?: number;
  /**
   * Number of times to retry if violations are found
   */
  retries?: number;
}

/**
 * Context object for specifying include/exclude selectors
 */
export interface ContextObject {
  include?: string[];
  exclude?: string[];
}

/**
 * Combined options for axe.run including Cypress-specific options
 */
export type AxeRunOptions = RunOptions & AxeBuilderOptions;

/**
 * Window with axe-core injected
 */
export interface WindowWithAxe extends Window {
  axe: {
    run: (context?: any, options?: RunOptions) => Promise<AxeResults>;
    configure: (config: Spec) => void;
  };
}

// Cypress chainable interface declarations
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      // Cypress chainable interface
    }
  }
}