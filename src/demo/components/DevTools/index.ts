/**
 * DEV TOOLS MODULE
 *
 * This module contains development and testing utilities that are NOT part
 * of the production Plinko game application. These tools are for local
 * development, testing, and debugging purposes only.
 *
 * Components in this module should be conditionally rendered or excluded
 * from production builds.
 *
 * USAGE:
 * Always import DevToolsLoader instead of DevToolsMenu directly in production code.
 * DevToolsLoader handles feature flags and lazy loading automatically.
 */

// Main entry point - use this in App.tsx
export { DevToolsLoader } from './DevToolsLoader';

// Individual components (for direct imports in tests or specific use cases)
export { DevToolsMenu } from './components/DevToolsMenu';
export type { ChoiceMechanic } from './components/DevToolsMenu';
export { ThemeSelector } from './components/ThemeSelector';
export { ViewportSelector } from './components/ViewportSelector';
