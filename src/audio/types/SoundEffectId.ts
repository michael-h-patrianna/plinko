/**
 * All sound effect IDs used in the Plinko game.
 * Based on the comprehensive sound design document.
 */
export type SoundEffectId =
  // UI Sounds (9 sounds)
  | 'ui-launch'
  | 'ui-button-tap'
  | 'ui-button-press'
  | 'ui-button-primary'
  | 'ui-drop-position'
  | 'ui-settings-open'
  | 'ui-settings-close'
  | 'ui-slider-drag'
  | 'ui-toast'

  // Countdown (6 sounds)
  | 'countdown-3'
  | 'countdown-2'
  | 'countdown-1'
  | 'countdown-go'
  | 'countdown-ring'
  | 'countdown-particles'

  // Ball Physics (8 sounds)
  | 'ball-drop'
  | 'ball-trail'
  | 'ball-peg-hit'
  | 'ball-peg-hit-low'
  | 'ball-peg-hit-high'
  | 'ball-peg-flash'
  | 'ball-peg-ripple'
  | 'ball-wall-hit'

  // Landing (4 sounds)
  | 'land-impact-win'
  | 'land-impact-nowin'
  | 'land-shockwave'
  | 'land-glow'

  // Anticipation (5 sounds)
  | 'antic-heartbeat'
  | 'antic-scale-up'
  | 'antic-focus'
  | 'antic-dim'
  | 'antic-build'

  // Win Celebration (7 sounds)
  | 'win-confetti-burst'
  | 'win-confetti-trail'
  | 'win-star-burst'
  | 'win-flash'
  | 'win-stinger'
  | 'win-tada'
  | 'win-reveal'

  // No Win (4 sounds)
  | 'nowin-landing'
  | 'nowin-acknowledge'
  | 'nowin-dim'
  | 'nowin-affirmation'

  // Prize Reveal (7 sounds)
  | 'prize-you-won'
  | 'prize-counter'
  | 'prize-icon-pop'
  | 'prize-badge'
  | 'prize-claim-appear'
  | 'prize-claim-press'
  | 'prize-claimed'

  // Screen Effects (3 sounds)
  | 'fx-screen-shake'
  | 'fx-screen-shake-subtle'
  | 'fx-haptic'

  // Ambient (2 sounds)
  | 'amb-idle'
  | 'amb-board-hum'

  // Error (2 sounds)
  | 'err-notification'
  | 'err-loading';
