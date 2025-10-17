/**
 * Centralized timing constants for animations, timeouts, and delays
 * All values in milliseconds unless otherwise noted
 */

// ============================================================================
// Animation Durations
// ============================================================================

export const ANIMATION_DURATION = {
  /** Extra fast animations (100ms) - button transitions, quick feedback */
  EXTRA_FAST: 100,

  /** Fast animations (150ms) - peg flashes, quick transitions */
  FAST: 150,

  /** Quick animations (180ms) - ball transforms during drop */
  QUICK: 180,

  /** Normal animations (300ms) - standard transitions, peg pulses */
  NORMAL: 300,

  /** Slower animations (500ms) - screen shake, landing effects */
  SLOW: 500,

  /** Win reveal delay (600ms) - anticipation before showing prize */
  WIN_REVEAL_DELAY: 600,

  /** Countdown step duration (800ms) - each number shows for this long */
  COUNTDOWN_STEP: 800,
} as const;

// ============================================================================
// Game State Timeouts
// ============================================================================

export const GAME_TIMEOUT = {
  /** Landing complete timeout (500ms) - added after trajectory completes */
  LANDING_COMPLETE: 500,

  /** Auto-reveal prize timeout (320ms) - after ball lands */
  AUTO_REVEAL: 320,
} as const;

// ============================================================================
// API & Loading Timeouts
// ============================================================================

export const API_TIMEOUT = {
  /** Max retries for prize provider loading */
  MAX_RETRIES: 3,

  /** Base retry delay (1000ms) - multiplied by attempt number */
  RETRY_DELAY: 1000,

  /** Prize provider load timeout (10000ms = 10 seconds) */
  LOAD_TIMEOUT: 10000,
} as const;

// ============================================================================
// UI Effect Delays
// ============================================================================

export const UI_DELAY = {
  /** Currency counter increment interval (100ms) */
  COUNTER_INCREMENT: 100,

  /** Currency counter pop effect delay (default, can be overridden) */
  COUNTER_POP: 0,

  /** Stagger delay between multiple currency counters (150ms) */
  COUNTER_STAGGER: 150,

  /** Screen shake duration (400ms) */
  SCREEN_SHAKE_DURATION: 400,
} as const;

// ============================================================================
// Test Timeouts
// ============================================================================

export const TEST_TIMEOUT = {
  /** Short delay for async operations (50ms) */
  SHORT: 50,

  /** Standard delay for component updates (100ms) */
  STANDARD: 100,

  /** Long delay for complex operations (500ms) */
  LONG: 500,

  /** Extra long timeout for integration tests (15000ms = 15 seconds) */
  EXTRA_LONG: 15000,
} as const;
