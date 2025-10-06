/**
 * Platform Adapters - Main Entry Point
 *
 * Provides cross-platform abstractions for web and React Native
 *
 * All adapters export platform-specific implementations that are
 * automatically selected based on the build target:
 * - Web builds use .web.ts files
 * - React Native builds use .native.ts files
 *
 * Usage:
 * ```ts
 * import { cryptoAdapter, dimensionsAdapter } from '@/utils/platform';
 *
 * const seed = cryptoAdapter.generateSecureRandomSeed();
 * const width = dimensionsAdapter.getWidth();
 * ```
 */

// Platform detection
export * from './detect';

// Adapters
export * from './crypto';
export * from './dimensions';
export * from './deviceInfo';
export * from './storage';
export * from './animation';
export * from './navigation';
export * from './performance';
