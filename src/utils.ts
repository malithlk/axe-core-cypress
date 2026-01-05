/// <reference types="cypress" />

import type { WindowWithAxe } from './types';

/**
 * Gets the path to the axe-core script
 * @returns Path to axe-core script
 */
export function getAxeCorePath(): string {
  if (typeof require.resolve === 'function') {
    return require.resolve('axe-core/axe.min.js');
  }
  return 'node_modules/axe-core/axe.min.js';
}

/**
 * Checks if axe is already injected in the window
 * @param win - Window object
 * @returns True if axe is available
 */
export function isAxeInjected(win: Window): win is WindowWithAxe {
  return (
    'axe' in win &&
    typeof (win as any).axe === 'object' &&
    typeof (win as any).axe.run === 'function'
  );
}

/**
 * Injects axe-core into the current window
 * @param win - Window object to inject into
 * @param source - Axe-core source code
 */
export function injectAxeCore(win: Window, source: string): void {
  (win as any).eval(source);
}

/**
 * Normalizes a selector or array of selectors to an array
 * @param selector - Single selector or array of selectors
 * @returns Array of selectors
 */
export function normalizeSelector(selector: string | string[]): string[] {
  return Array.isArray(selector) ? selector : [selector];
}
