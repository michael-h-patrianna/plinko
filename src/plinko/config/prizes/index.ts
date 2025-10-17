/**
 * Barrel export for prize configuration
 */

export {
  MOCK_PRIZES,
  generateRandomPrizeSet,
  getPrizeByIndex,
  createValidatedPrizeSet,
} from './prizeTable';

export {
  DEFAULT_PRODUCTION_PRIZE_COUNT,
  generateProductionPrizeSet,
  createValidatedProductionPrizeSet,
} from './productionPrizeTable';

export type {
  ProductionPrizeSetOptions,
} from './productionPrizeTable';
