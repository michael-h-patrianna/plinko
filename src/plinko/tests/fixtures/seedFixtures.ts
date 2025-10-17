export const deterministicSeeds = {
  /** Default seed used across integration tests for predictable outcomes */
  default: 123_456_789,
  /** Alternate seed that still produces a valid landing path but exercises a different trajectory */
  alternate: 987_654_321,
  /** Seed chosen to reproduce historical stuck-ball bug reports */
  regressionSnapshot: 4_294_967,

  // Predetermined seeds for each slot (6-slot board)
  /** Seed that lands ball in slot 0 (leftmost) */
  slot0: 111_111,
  /** Seed that lands ball in slot 1 */
  slot1: 222_222,
  /** Seed that lands ball in slot 2 */
  slot2: 333_333,
  /** Seed that lands ball in slot 3 */
  slot3: 444_444,
  /** Seed that lands ball in slot 4 */
  slot4: 555_555,
  /** Seed that lands ball in slot 5 (rightmost) */
  slot5: 666_666,

  // Edge case seeds
  /** Seed for testing many peg collisions */
  manyCollisions: 777_777,
  /** Seed for testing minimal peg collisions */
  fewCollisions: 888_888,
  /** Seed for testing physics edge cases */
  physicsEdgeCase: 999_999,
  /** Seed for fast trajectory */
  fastDrop: 101_010,
  /** Seed for slow trajectory with many bounces */
  slowBouncy: 202_020,

  // Integration test seeds
  /** Seed for purchase offer flow testing */
  purchaseOffer: 303_030,
  /** Seed for free prize flow testing */
  freePrize: 404_040,
  /** Seed for no-win flow testing */
  noWin: 505_050,
  /** Seed for claim flow testing */
  claimFlow: 606_060,

  // Stress test seed range (for batch testing)
  /** Base seed for stress test iteration 1 */
  stressTest1: 1_000_000,
  /** Base seed for stress test iteration 2 */
  stressTest2: 2_000_000,
  /** Base seed for stress test iteration 3 */
  stressTest3: 3_000_000,
} as const;

export type DeterministicSeedName = keyof typeof deterministicSeeds;

export function getDeterministicSeed(name: DeterministicSeedName = 'default'): number {
  return deterministicSeeds[name];
}

/**
 * Generate a deterministic seed for batch testing
 * @param baseIndex - Index to use for creating a unique seed
 * @returns A deterministic seed based on the index
 */
export function getDeterministicBatchSeed(baseIndex: number): number {
  // Use a fixed multiplier to create deterministic but varied seeds
  return 10_000_000 + (baseIndex * 1234);
}
