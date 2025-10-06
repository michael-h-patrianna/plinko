/**
 * Storage Platform Adapter Types
 *
 * Provides persistent key-value storage across web and React Native platforms
 *
 * IMPORTANT: React Native's AsyncStorage is asynchronous, so all methods
 * return Promises even though web's localStorage is synchronous.
 * This ensures a consistent API across platforms.
 */

export interface StorageAdapter {
  /**
   * Gets a value from storage
   *
   * @param key - The storage key
   * @returns Promise resolving to the value, or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Sets a value in storage
   *
   * @param key - The storage key
   * @param value - The value to store
   * @returns Promise that resolves when storage is complete
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Removes a value from storage
   *
   * @param key - The storage key
   * @returns Promise that resolves when removal is complete
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clears all values from storage
   *
   * @returns Promise that resolves when clearing is complete
   */
  clear(): Promise<void>;

  /**
   * Gets all keys in storage
   *
   * @returns Promise resolving to array of all keys
   */
  getAllKeys(): Promise<string[]>;
}
