/**
 * Barrel export for game logic modules
 */

// Types
export type {
  PrizeConfig,
  GameState,
  BallPosition,
  TrajectoryPoint,
  DropZone,
  GameContext,
  DeterministicTrajectoryPayload,
  PegPosition,
  SlotPosition,
} from './types';

// Board geometry
export {
  PHYSICS,
  BOARD,
  RESPONSIVE,
  DROP_ZONE_POSITIONS,
  DROP_ZONE_RANGES,
  generatePegLayout,
  calculateSlotDimensions,
  getDropZoneRange,
  getDropZoneCenter,
  clampSlotIndexFromX,
  getSlotBoundaries,
} from './boardGeometry';

// Prize provider
export {
  createDefaultPrizeProvider,
  createFixturePrizeProvider,
  validatePrizeProviderPayload,
} from './prizeProvider';

export type {
  PrizeProviderSource,
  PrizeProviderResult,
  PrizeProviderContext,
} from './prizeProvider';

// Prize types
export {
  getSlotDisplayText,
  getFullRewardDescription,
} from './prizeTypes';

// Prize validation
export {
  PrizeValidationError,
  validatePrize,
  validatePrizes,
  validatePrizeOrThrow,
  validatePrizesOrThrow,
  isPrize,
  isPrizeType,
} from './prizeValidation';

// Random number generation
export {
  createRng,
  generateSeed,
  selectPrize,
} from './rng';

// State machine
export {
  transition,
} from './stateMachine';

// Physics and trajectory
export {
  generateTrajectory,
} from './trajectory';
