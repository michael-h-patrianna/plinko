/**
 * Centralized timing configuration
 * All durations and delays in seconds (for Framer Motion) unless specified otherwise
 */

/**
 * Currency counter animation timings
 */
export const CURRENCY_COUNTER = {
  /** Duration between counter increments in milliseconds */
  INCREMENT_INTERVAL_MS: 100,
  /** Duration of pop animation */
  POP_DURATION_MS: 300,
  /** Duration for floating indicator removal */
  INDICATOR_DURATION_MS: 800,
} as const;

/**
 * General UI transition timings
 */
export const UI_TRANSITIONS = {
  /** Quick fade/scale transitions */
  QUICK: 0.2,
  /** Standard fade/slide transitions */
  STANDARD: 0.25,
  /** Medium-length transitions */
  MEDIUM: 0.3,
  /** Longer transitions for emphasis */
  LONG: 0.4,
  /** Very long transitions for dramatic effect */
  EXTRA_LONG: 0.5,
} as const;

/**
 * Popup and modal animation timings
 */
export const POPUP = {
  /** Popup container fade in/out */
  CONTAINER_FADE: 0.4,
  /** Popup overlay background fade */
  OVERLAY_FADE: 0.2,
  /** Popup content scale animation */
  CONTENT_SCALE: 0.3,
  /** Loading spinner rotation duration */
  SPINNER_ROTATION: 1.0,
} as const;

/**
 * Game element animation timings
 */
export const GAME = {
  /** Ball launcher scale animation */
  LAUNCHER_SCALE: 0.3,
  /** Ball launcher arrow opacity delay */
  LAUNCHER_ARROW_DELAY: 0.3,
  /** Ball launcher arrow opacity duration */
  LAUNCHER_ARROW_OPACITY: 0.2,
  /** Ball launcher pulse animation duration */
  LAUNCHER_PULSE: 1.5,
  /** Ball launcher exit animation */
  LAUNCHER_EXIT: 0.2,
  /** Drop position controls slide animation */
  DROP_CONTROLS_SLIDE: 0.4,
  /** Drop position background fade */
  DROP_BACKGROUND_FADE: 0.3,
  /** Drop position background delay */
  DROP_BACKGROUND_DELAY: 0.2,
  /** Drop position guide delay */
  DROP_GUIDE_DELAY: 0.1,
  /** Board fade animation */
  BOARD_FADE: 0.5,
  /** Board exit animation */
  BOARD_EXIT: 0.3,
  /** Peg/slot impact animation */
  IMPACT_FLASH: 0.15,
  /** Slot border animation */
  SLOT_BORDER: 0.2,
} as const;

/**
 * Win animation timings
 */
export const WIN_ANIMATIONS = {
  /** Ball landing impact scale animation */
  BALL_IMPACT_SCALE: 0.4,
  /** Ball landing flash duration */
  BALL_IMPACT_FLASH: 0.3,
  /** Slot anticipation glow duration */
  SLOT_ANTICIPATION_GLOW: 2.0,
  /** Slot win reveal border animation */
  SLOT_REVEAL_BORDER: 0.6,
  /** Slot win reveal gradient animation */
  SLOT_REVEAL_GRADIENT: 4.0,
  /** Slot win reveal icon pulse */
  SLOT_REVEAL_ICON_PULSE: 1.5,
  /** Slot win reveal particles fade in */
  SLOT_REVEAL_PARTICLES_FADE: 0.7,
  /** Slot win reveal particles fade delay */
  SLOT_REVEAL_PARTICLES_DELAY: 0.3,
  /** Slot win reveal fireworks animation */
  SLOT_REVEAL_FIREWORKS: 1.5,
  /** Slot win reveal fireworks delay */
  SLOT_REVEAL_FIREWORKS_DELAY: 0.5,
  /** Slot win reveal star burst animation */
  SLOT_REVEAL_STAR_BURST: 1.5,
  /** Slot win reveal star burst stagger delay multiplier */
  SLOT_REVEAL_STAR_BURST_STAGGER: 0.1,
  /** Slot win reveal star burst delay */
  SLOT_REVEAL_STAR_BURST_DELAY: 0.4,
  /** "You Won" text main animation */
  YOU_WON_MAIN: 0.5,
  /** "You Won" text shadow animation */
  YOU_WON_SHADOW: 0.45,
  /** "You Won" text shadow delay */
  YOU_WON_SHADOW_DELAY: 0.05,
  /** "You Won" text exit */
  YOU_WON_EXIT: 0.2,
  /** "You Won" letter stagger animation */
  YOU_WON_LETTER: 0.6,
  /** "You Won" letter base delay */
  YOU_WON_LETTER_DELAY: 0.1,
  /** "You Won" letter stagger multiplier */
  YOU_WON_LETTER_STAGGER: 0.04,
  /** "You Won" glow animation */
  YOU_WON_GLOW: 0.6,
  /** "You Won" glow base delay */
  YOU_WON_GLOW_DELAY: 0.5,
} as const;

/**
 * Prize reveal screen timings
 */
export const PRIZE_REVEAL = {
  /** Screen fade in */
  SCREEN_FADE: 0.3,
  /** Prize card fade in */
  CARD_FADE: 0.4,
  /** Prize title animation */
  TITLE_ANIMATION: 0.25,
  /** Prize title delay */
  TITLE_DELAY: 0.1,
  /** Reward item animation */
  REWARD_ITEM: 0.4,
  /** Reward item scale animation */
  REWARD_ITEM_SCALE: 0.25,
  /** Claim button fade in */
  CLAIM_BUTTON: 0.3,
  /** Claim button delay (see orchestrateWinSequence for actual values) */
  CLAIM_BUTTON_DELAY: 0.5,
  /** No win message animation */
  NO_WIN_MESSAGE: 0.25,
  /** No win message delay */
  NO_WIN_MESSAGE_DELAY: 0.2,
  /** No win title delay */
  NO_WIN_TITLE_DELAY: 0.3,
  /** No win button delay */
  NO_WIN_BUTTON_DELAY: 0.4,
  /** Purchase offer animation */
  PURCHASE_ANIMATION: 0.35,
  /** Purchase offer delay */
  PURCHASE_DELAY: 0.4,
  /** Purchase badge rotation */
  PURCHASE_BADGE_ROTATION: 2.0,
  /** Purchase price delay */
  PURCHASE_PRICE_DELAY: 0.3,
  /** Purchase savings delay */
  PURCHASE_SAVINGS_DELAY: 0.5,
  /** Purchase button delay */
  PURCHASE_BUTTON_DELAY: 1.4,
} as const;

/**
 * Prize claimed screen timings
 */
export const PRIZE_CLAIMED = {
  /** Screen fade in */
  SCREEN_FADE: 0.3,
  /** Checkmark scale animation */
  CHECKMARK_SCALE: 1.2,
  /** Checkmark base delay */
  CHECKMARK_DELAY: 0.15,
  /** Checkmark stagger multiplier per item */
  CHECKMARK_STAGGER: 0.15,
  /** Message fade delay */
  MESSAGE_DELAY: 0.15,
  /** Reward summary animation */
  SUMMARY_ANIMATION: 0.35,
  /** Reward summary delay */
  SUMMARY_DELAY: 0.5,
  /** Continue button animation */
  CONTINUE_BUTTON: 0.25,
  /** Continue button delay */
  CONTINUE_BUTTON_DELAY: 0.8,
} as const;

/**
 * Start screen timings
 */
export const START_SCREEN = {
  /** Screen fade in */
  SCREEN_FADE: 0.2,
  /** Title animation */
  TITLE_ANIMATION: 0.25,
  /** Title delay */
  TITLE_DELAY: 0.1,
  /** Subtitle delay */
  SUBTITLE_DELAY: 0.2,
  /** Prize card animation */
  PRIZE_CARD_ANIMATION: 0.3,
  /** Prize card base delay */
  PRIZE_CARD_DELAY: 0.3,
  /** Prize card stagger multiplier */
  PRIZE_CARD_STAGGER: 0.05,
  /** Play button animation */
  PLAY_BUTTON_ANIMATION: 0.2,
} as const;

/**
 * Themed button timings
 */
export const BUTTON = {
  /** Button scale animation */
  SCALE_ANIMATION: 0.26,
  /** Button press animation */
  PRESS_ANIMATION: 0.25,
  /** Button shimmer animation duration */
  SHIMMER_DURATION: 3.0,
} as const;

/**
 * Screen shake timings
 */
export const SCREEN_SHAKE = {
  /** Default screen shake duration in milliseconds */
  DEFAULT_DURATION_MS: 500,
} as const;

/**
 * Easy access to common timing patterns
 */
export const TIMING_PRESETS = {
  /** Smooth bounce easing for playful animations */
  BOUNCE_EASE: [0.34, 1.56, 0.64, 1] as const,
  /** Smooth ease for standard animations */
  SMOOTH_EASE: [0.4, 0, 0.2, 1] as const,
  /** Linear easing for continuous animations */
  LINEAR_EASE: 'linear' as const,
  /** Ease out for exit animations */
  EASE_OUT: 'easeOut' as const,
} as const;
