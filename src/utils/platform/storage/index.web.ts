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

  getItem(key: string): Promise<string | null> {
    return this.executeAsync('getItem', () => Promise.resolve(this.storage.getItem(key)), {
      defaultValue: null,
    });
  }

  setItem(key: string, value: string): Promise<void> {
    return this.executeAsync(
      'setItem',
      () => {
        this.storage.setItem(key, value);
        return Promise.resolve();
      },
      { rethrow: true }
    );
  }

  removeItem(key: string): Promise<void> {
    return this.executeAsync(
      'removeItem',
      () => {
        this.storage.removeItem(key);
        return Promise.resolve();
      },
      { rethrow: true }
    );
  }

  clear(): Promise<void> {
    return this.executeAsync(
      'clear',
      () => {
        this.storage.clear();
        return Promise.resolve();
      },
      { rethrow: true }
    );
  }

  getAllKeys(): Promise<string[]> {
    return this.executeAsync('getAllKeys', () => Promise.resolve(Object.keys(this.storage)), {
      defaultValue: [],
    });
  }
}

export const storageAdapter: StorageAdapter = new WebStorageAdapter();
