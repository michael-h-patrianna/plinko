/**
 * All sound effect IDs used in the Plinko game.
 * Based on the comprehensive sound design document.
 */
export type SoundEffectId =
  // UI Sounds (9 sounds)
  | 'ui-button-press'

  // Countdown
  | 'countdown-3'
  | 'countdown-2'
  | 'countdown-1'
  | 'countdown-go'

  // Ball Physics
  | 'ball-peg-hit'
  | 'ball-wall-hit'
  | 'ball-slot-hit'

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
