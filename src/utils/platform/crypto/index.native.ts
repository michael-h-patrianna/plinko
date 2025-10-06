/**
 * Crypto Platform Adapter - React Native Implementation
 *
 * Uses expo-crypto or react-native-get-random-values for cryptographically
 * secure random number generation
 *
 * NOTE: This is a placeholder implementation. In a real React Native app, you would:
 * 1. Install: npm install expo-crypto
 *    OR: npm install react-native-get-random-values
 * 2. Import the polyfill at the top of your entry file
 * 3. Use the same Web Crypto API
 */

import { throwNativeNotImplemented } from '../detect';
import type { CryptoAdapter } from './types';

class NativeCryptoAdapter implements CryptoAdapter {
  generateSecureRandomSeed(): number {
    throwNativeNotImplemented('Crypto.generateSecureRandomSeed');
  }

  getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(_array: T): T {
    throwNativeNotImplemented('Crypto.getRandomValues');
  }
}

export const cryptoAdapter: CryptoAdapter = new NativeCryptoAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * Option 1: Using expo-crypto (recommended if using Expo)
 * ------------------------------------------------------
 * 1. Install: npx expo install expo-crypto
 * 2. Replace the above implementation with:
 *
 *    import * as Crypto from 'expo-crypto';
 *
 *    class NativeCryptoAdapter implements CryptoAdapter {
 *      generateSecureRandomSeed(): number {
 *        const bytes = Crypto.getRandomBytes(4);
 *        const view = new DataView(bytes.buffer);
 *        return view.getUint32(0, false);
 *      }
 *
 *      getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T {
 *        const bytes = Crypto.getRandomBytes(array.byteLength);
 *        array.set(new Uint8Array(bytes));
 *        return array;
 *      }
 *    }
 *
 * Option 2: Using react-native-get-random-values (bare React Native)
 * ------------------------------------------------------------------
 * 1. Install: npm install react-native-get-random-values
 * 2. Import at the top of your entry file (index.js): import 'react-native-get-random-values';
 * 3. Replace the above implementation with:
 *
 *    // Polyfill is imported globally, so we can use the standard Web Crypto API
 *    class NativeCryptoAdapter implements CryptoAdapter {
 *      generateSecureRandomSeed(): number {
 *        const array = new Uint32Array(1);
 *        crypto.getRandomValues(array);
 *        return array[0]!;
 *      }
 *
 *      getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array>(array: T): T {
 *        crypto.getRandomValues(array);
 *        return array;
 *      }
 *    }
 */
