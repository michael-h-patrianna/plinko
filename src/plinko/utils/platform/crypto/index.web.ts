/**
 * Crypto Platform Adapter - Web Implementation
 *
 * Uses the Web Crypto API for cryptographically secure random number generation
 */

import type { CryptoAdapter } from './types';

class WebCryptoAdapter implements CryptoAdapter {
  generateSecureRandomSeed(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0]!;
  }

  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T {
    crypto.getRandomValues(array);
    return array;
  }
}

export const cryptoAdapter: CryptoAdapter = new WebCryptoAdapter();
