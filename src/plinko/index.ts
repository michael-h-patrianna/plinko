/**
 * Plinko Game - Public API
 *
 * This is the main entry point for integrating the Plinko game into your application.
 * Import from this file to access all game components, hooks, and utilities.
 *
 * @example
 * ```typescript
 * import {
 *   usePlinkoGame,
 *   PlinkoBoard,
 *   StartScreen,
 *   ThemeProvider,
 *   themes
 * } from '@plinko';
 * ```
 */

// ============================================================================
// MAIN GAME HOOK
// ============================================================================

export { usePlinkoGame } from './hooks/usePlinkoGame';

// ============================================================================
// GAME STATE & TYPES
// ============================================================================

export type { Prize, PrizeType } from './game/prizeTypes';
export type { GameState, PrizeConfig, TrajectoryCache, TrajectoryPoint } from './game/types';

// ============================================================================
// CORE GAME COMPONENTS
// ============================================================================

// Screens
export { PrizeClaimed } from './components/screens/PrizeClaimed';
export { PrizeReveal } from './components/screens/PrizeReveal';
export { StartScreen } from './components/screens/StartScreen';

// Game Components
export { BallLauncher } from './components/game/BallLauncher';
export { Countdown } from './components/game/Countdown';
export { PlinkoBoard } from './components/game/PlinkoBoard/PlinkoBoard';

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

export { CelebrationOverlay } from './components/effects/celebrations';
export { CurrencyCounter } from './components/effects/CurrencyCounter';
export { ScreenShake } from './components/effects/ScreenShake';
export { YouWonText } from './components/effects/YouWonText';

// ============================================================================
// UI PRIMITIVES
// ============================================================================

export { GradientText } from './components/ui/GradientText';
export { ThemedButton } from './components/ui/ThemedButton';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { GameBoardErrorBoundary } from './components/layout/GameBoardErrorBoundary';
export { PopupContainer } from './components/layout/PopupContainer';
export { PopupOverlay } from './components/layout/PopupOverlay';
export { PrizeErrorBoundary } from './components/layout/PrizeErrorBoundary';

// ============================================================================
// THEME SYSTEM
// ============================================================================

export { ThemeProvider, themes, useTheme } from './theme';
export type { Theme, ThemeColors, ThemeGradients } from './theme/types';

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

export { AudioProvider } from './audio/context/AudioProvider';
export { useAudio } from './audio/context/useAudio';
export { useAudioPreloader } from './audio/hooks/useAudioPreloader';
export { useMusicManager } from './audio/hooks/useMusicManager';
export type { MusicTrackId, SoundEffectId } from './audio/types';

// ============================================================================
// HOOKS
// ============================================================================

export { useAppUIState } from './hooks/useAppUIState';
export { useGameAnimation } from './hooks/useGameAnimation';
export { useGameState } from './hooks/useGameState';
export { usePrizeSession } from './hooks/usePrizeSession';
export { useShakeController } from './hooks/useShakeController';
export { useViewportManager } from './hooks/useViewportManager';
export { useWinAnimationState } from './hooks/useWinAnimationState';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Export config but avoid naming conflicts with utils
export {
  BOARD_DIMENSIONS,
  BREAKPOINTS,
  BUTTON,
  COMMON_MOBILE_VIEWPORTS,
  CURRENCY_COUNTER,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  DEVICE_THRESHOLDS,
  GAME,
  MAX_MOBILE_WIDTH,
  MEDIA_QUERIES,
  MOCK_PRIZES,
  PHYSICS_DIMENSIONS,
  POPUP,
  PRIZE_CLAIMED,
  PRIZE_REVEAL,
  SCREEN_SHAKE,
  START_SCREEN,
  TIMING_PRESETS,
  UI_TRANSITIONS,
  WIN_ANIMATIONS,
  clampToMobileMax,
  createValidatedPrizeSet,
  createValidatedProductionPrizeSet,
  generateProductionPrizeSet,
  generateRandomPrizeSet,
  getDeviceTypeFromWidth,
  isDesktopWidth,
  isMobileWidth,
  isTabletWidth,
} from './config';
export type { ProductionPrizeSetOptions } from './config';

// ============================================================================
// CONSTANTS
// ============================================================================

export * from './constants';

// ============================================================================
// PLATFORM UTILITIES
// ============================================================================

export * from './utils/platform';

// ============================================================================
// UTILITIES
// ============================================================================

export { abbreviateNumber } from './utils/formatNumber';
export * from './utils/prizeUtils';
export * from './utils/slotDimensions';
