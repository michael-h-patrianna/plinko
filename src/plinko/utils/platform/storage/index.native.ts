/**
 * Storage Platform Adapter - React Native Implementation
 *
 * Uses AsyncStorage for persistent key-value storage
 *
 * NOTE: This is a placeholder implementation. In a real React Native app, you would:
 * 1. Install: npm install @react-native-async-storage/async-storage
 * 2. Link native dependencies (if not using Expo)
 * 3. Import AsyncStorage and use it as shown below
 */

import { throwNativeNotImplemented } from '../detect';
import type { StorageAdapter } from './types';

function rejectNative(feature: string): Promise<never> {
  try {
    throwNativeNotImplemented(feature);
  } catch (error) {
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  }
}

class NativeStorageAdapter implements StorageAdapter {
  getItem(_key: string): Promise<string | null> {
    return rejectNative('Storage.getItem');
  }

  setItem(_key: string, _value: string): Promise<void> {
    return rejectNative('Storage.setItem');
  }

  removeItem(_key: string): Promise<void> {
    return rejectNative('Storage.removeItem');
  }

  clear(): Promise<void> {
    return rejectNative('Storage.clear');
  }

  getAllKeys(): Promise<string[]> {
    return rejectNative('Storage.getAllKeys');
  }
}

export const storageAdapter: StorageAdapter = new NativeStorageAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * 1. Install AsyncStorage:
 *    npm install @react-native-async-storage/async-storage
 *    OR for Expo: npx expo install @react-native-async-storage/async-storage
 *
 * 2. Replace the above implementation with:
 *
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import type { StorageAdapter } from './types';
 *
 * class NativeStorageAdapter implements StorageAdapter {
 *   async getItem(key: string): Promise<string | null> {
 *     try {
 *       return await AsyncStorage.getItem(key);
 *     } catch (error) {
 *       console.error('[Storage] Error getting item:', error);
 *       return null;
 *     }
 *   }
 *
 *   async setItem(key: string, value: string): Promise<void> {
 *     try {
 *       await AsyncStorage.setItem(key, value);
 *     } catch (error) {
 *       console.error('[Storage] Error setting item:', error);
 *       throw error;
 *     }
 *   }
 *
 *   async removeItem(key: string): Promise<void> {
 *     try {
 *       await AsyncStorage.removeItem(key);
 *     } catch (error) {
 *       console.error('[Storage] Error removing item:', error);
 *       throw error;
 *     }
 *   }
 *
 *   async clear(): Promise<void> {
 *     try {
 *       await AsyncStorage.clear();
 *     } catch (error) {
 *       console.error('[Storage] Error clearing storage:', error);
 *       throw error;
 *     }
 *   }
 *
 *   async getAllKeys(): Promise<string[]> {
 *     try {
 *       return await AsyncStorage.getAllKeys();
 *     } catch (error) {
 *       console.error('[Storage] Error getting keys:', error);
 *       return [];
 *     }
 *   }
 * }
 *
 * export const storageAdapter: StorageAdapter = new NativeStorageAdapter();
 *
 * // Alternative: For better performance on React Native, consider:
 * // npm install react-native-mmkv
 * // (Synchronous, faster than AsyncStorage)
 */
