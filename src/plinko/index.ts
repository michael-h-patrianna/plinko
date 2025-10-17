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

export type { GameState, PrizeConfig, TrajectoryPoint, TrajectoryCache } from './game/types';
export type { Prize, PrizeType } from './game/prizeTypes';

// ============================================================================
// CORE GAME COMPONENTS
// ============================================================================

// Screens
export { StartScreen } from './components/screens/StartScreen';
export { PrizeReveal } from './components/screens/PrizeReveal';
export { PrizeClaimed } from './components/screens/PrizeClaimed';

// Game Components
export { PlinkoBoard } from './components/game/PlinkoBoard/PlinkoBoard';
export { BallLauncher } from './components/game/BallLauncher';
export { Countdown } from './components/game/Countdown';

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

export { CelebrationOverlay } from './components/effects/celebrations';
export { ScreenShake } from './components/effects/ScreenShake';
export { CurrencyCounter } from './components/effects/CurrencyCounter';
export { YouWonText } from './components/effects/YouWonText';

// ============================================================================
// UI PRIMITIVES
// ============================================================================

export { GradientText } from './components/ui/GradientText';
export { ThemedButton } from './components/ui/ThemedButton';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { PopupContainer } from './components/layout/PopupContainer';
export { PopupOverlay } from './components/layout/PopupOverlay';
export { GameBoardErrorBoundary } from './components/layout/GameBoardErrorBoundary';
export { PrizeErrorBoundary } from './components/layout/PrizeErrorBoundary';

// ============================================================================
// THEME SYSTEM
// ============================================================================

export { ThemeProvider, useTheme } from './theme';
export { themes } from './theme';
export type { Theme, ThemeColors, ThemeGradients } from './theme/types';

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

export { AudioProvider, useAudio } from './audio/context/AudioProvider';
export { useAudioPreloader } from './audio/hooks/useAudioPreloader';
export { useMusicManager } from './audio/hooks/useMusicManager';
export type { SoundEffectId, MusicTrackId } from './audio/types';

// ============================================================================
// HOOKS
// ============================================================================

export { useGameState } from './hooks/useGameState';
export { usePrizeSession } from './hooks/usePrizeSession';
export { useAppUIState } from './hooks/useAppUIState';
export { useViewportManager } from './hooks/useViewportManager';
export { useShakeController } from './hooks/useShakeController';
export { useWinAnimationState } from './hooks/useWinAnimationState';
export { useGameAnimation } from './hooks/useGameAnimation';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Export config but avoid naming conflicts with utils
export {
  MOCK_PRIZES,
  generateRandomPrizeSet,
  createValidatedPrizeSet,
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  generateProductionPrizeSet,
  createValidatedProductionPrizeSet,
  CURRENCY_COUNTER,
  UI_TRANSITIONS,
  POPUP,
  GAME,
  WIN_ANIMATIONS,
  PRIZE_REVEAL,
  PRIZE_CLAIMED,
  START_SCREEN,
  BUTTON,
  SCREEN_SHAKE,
  TIMING_PRESETS,
  BREAKPOINTS,
  MAX_MOBILE_WIDTH,
  DEVICE_THRESHOLDS,
  COMMON_MOBILE_VIEWPORTS,
  BOARD_DIMENSIONS,
  PHYSICS_DIMENSIONS,
  MEDIA_QUERIES,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  getDeviceTypeFromWidth,
  clampToMobileMax,
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
export * from './utils/slotDimensions';
export * from './utils/prizeUtils';
