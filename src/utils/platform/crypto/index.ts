/**
 * Crypto Platform Adapter - Platform Selector
 *
 * Exports the correct implementation based on the current platform
 * Build tools should use .web.ts or .native.ts extensions for tree-shaking
 */

export * from './types';

// Platform-specific export (bundler will resolve based on platform)
// Metro (React Native) and Vite (Web) will pick the correct implementation
export { cryptoAdapter } from './index.web';
