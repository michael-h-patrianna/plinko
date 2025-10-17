/**
 * Storage Platform Adapter - Platform Selector
 *
 * Exports the correct implementation based on the current platform
 */

export * from './types';
export { storageAdapter } from './index.web';
