/**
 * Centralized constants barrel export
 * Import constants from this file to access all timing and dimension values
 *
 * @example
 * ```ts
 * import { ANIMATION_DURATION, VIEWPORT } from '@/constants';
 *
 * setTimeout(() => { ... }, ANIMATION_DURATION.WIN_REVEAL_DELAY);
 * const isMobile = width <= VIEWPORT.MAX_MOBILE;
 * ```
 */

export * from './timing';
export * from './dimensions';
