export const deterministicSeeds = {
  /** Default seed used across integration tests for predictable outcomes */
  default: 123_456_789,
  /** Alternate seed that still produces a valid landing path but exercises a different trajectory */
  alternate: 987_654_321,
  /** Seed chosen to reproduce historical stuck-ball bug reports */
  regressionSnapshot: 4_294_967,
} as const;

export type DeterministicSeedName = keyof typeof deterministicSeeds;

export function getDeterministicSeed(name: DeterministicSeedName = 'default'): number {
  return deterministicSeeds[name];
}
