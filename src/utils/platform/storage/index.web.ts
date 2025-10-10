/**
 * Storage Platform Adapter - Web Implementation (Refactored)
 *
 * Uses shared platform utilities for consistent error handling
 */

import { PlatformAdapter, requireFeature } from '../shared';
import type { StorageAdapter } from './types';

class WebStorageAdapter extends PlatformAdapter implements StorageAdapter {
  private storage: Storage;

  constructor() {
    super('WebStorage');
    this.storage = requireFeature('localStorage', () => window.localStorage);
  }

  async getItem(key: string): Promise<string | null> {
    return this.executeAsync(
      'getItem',
      async () => this.storage.getItem(key),
      { defaultValue: null }
    );
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.executeAsync(
      'setItem',
      async () => this.storage.setItem(key, value),
      { rethrow: true }
    );
  }

  async removeItem(key: string): Promise<void> {
    return this.executeAsync(
      'removeItem',
      async () => this.storage.removeItem(key),
      { rethrow: true }
    );
  }

  async clear(): Promise<void> {
    return this.executeAsync(
      'clear',
      async () => this.storage.clear(),
      { rethrow: true }
    );
  }

  async getAllKeys(): Promise<string[]> {
    return this.executeAsync(
      'getAllKeys',
      async () => Object.keys(this.storage),
      { defaultValue: [] }
    );
  }
}

export const storageAdapter: StorageAdapter = new WebStorageAdapter();
