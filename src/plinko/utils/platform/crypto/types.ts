/**
 * Crypto Platform Adapter Types
 *
 * Provides cryptographically secure random number generation
 * across web and React Native platforms
 */

export interface CryptoAdapter {
  /**
   * Generates a cryptographically secure random seed
   * Used for initializing the game's deterministic RNG
   *
   * @returns A random 32-bit unsigned integer
   */
  generateSecureRandomSeed(): number;

  /**
   * Fills a typed array with cryptographically secure random values
   *
   * @param array - The typed array to fill with random values
   */
  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T;
}
