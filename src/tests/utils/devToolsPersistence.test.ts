/**
 * Unit tests for dev tools persistence utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadDevSettings,
  saveDevSettings,
  clearDevSettings,
  DEFAULT_DEV_SETTINGS,
  type DevToolsSettings,
} from '@utils/devToolsPersistence';

describe('devToolsPersistence', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadDevSettings', () => {
    it('should return default settings when no data is stored', () => {
      const settings = loadDevSettings();
      expect(settings).toEqual(DEFAULT_DEV_SETTINGS);
    });

    it('should load and parse stored settings', () => {
      const storedSettings: DevToolsSettings = {
        choiceMechanic: 'none',
        showWinner: true,
        musicEnabled: true,
        performanceMode: 'power-saving',
        viewportWidth: 414,
        themeName: 'dark',
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(storedSettings);

      const settings = loadDevSettings();
      expect(settings).toEqual(storedSettings);
    });

    it('should validate choiceMechanic and use default for invalid values', () => {
      const storedSettings = {
        ...DEFAULT_DEV_SETTINGS,
        choiceMechanic: 'invalid-value',
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(storedSettings);

      const settings = loadDevSettings();
      expect(settings.choiceMechanic).toBe(DEFAULT_DEV_SETTINGS.choiceMechanic);
    });

    it('should validate performanceMode and use default for invalid values', () => {
      const storedSettings = {
        ...DEFAULT_DEV_SETTINGS,
        performanceMode: 'ultra-mode',
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(storedSettings);

      const settings = loadDevSettings();
      expect(settings.performanceMode).toBe(DEFAULT_DEV_SETTINGS.performanceMode);
    });

    it('should validate boolean fields and use defaults for invalid values', () => {
      const storedSettings = {
        ...DEFAULT_DEV_SETTINGS,
        showWinner: 'yes' as unknown as boolean,
        musicEnabled: 1 as unknown as boolean,
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(storedSettings);

      const settings = loadDevSettings();
      expect(settings.showWinner).toBe(DEFAULT_DEV_SETTINGS.showWinner);
      expect(settings.musicEnabled).toBe(DEFAULT_DEV_SETTINGS.musicEnabled);
    });

    it('should validate viewportWidth and use default for invalid values', () => {
      const storedSettings = {
        ...DEFAULT_DEV_SETTINGS,
        viewportWidth: 'wide' as unknown as number,
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(storedSettings);

      const settings = loadDevSettings();
      expect(settings.viewportWidth).toBe(DEFAULT_DEV_SETTINGS.viewportWidth);
    });

    it('should handle corrupt JSON gracefully', () => {
      localStorageMock['plinko-dev-settings'] = 'not-valid-json{]';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const settings = loadDevSettings();
      expect(settings).toEqual(DEFAULT_DEV_SETTINGS);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DevTools] Failed to load settings from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should merge partial settings with defaults', () => {
      const partialSettings = {
        choiceMechanic: 'none',
        musicEnabled: true,
      };

      localStorageMock['plinko-dev-settings'] = JSON.stringify(partialSettings);

      const settings = loadDevSettings();
      expect(settings.choiceMechanic).toBe('none');
      expect(settings.musicEnabled).toBe(true);
      // Other fields should have default values
      expect(settings.showWinner).toBe(DEFAULT_DEV_SETTINGS.showWinner);
      expect(settings.performanceMode).toBe(DEFAULT_DEV_SETTINGS.performanceMode);
      expect(settings.viewportWidth).toBe(DEFAULT_DEV_SETTINGS.viewportWidth);
      expect(settings.themeName).toBe(DEFAULT_DEV_SETTINGS.themeName);
    });
  });

  describe('saveDevSettings', () => {
    it('should save settings to localStorage', () => {
      const settings: DevToolsSettings = {
        choiceMechanic: 'none',
        showWinner: true,
        musicEnabled: false,
        performanceMode: 'power-saving',
        viewportWidth: 320,
        themeName: 'ocean',
      };

      saveDevSettings(settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'plinko-dev-settings',
        JSON.stringify(settings)
      );
      expect(localStorageMock['plinko-dev-settings']).toBe(JSON.stringify(settings));
    });

    it('should handle storage errors gracefully', () => {
      const settings: DevToolsSettings = DEFAULT_DEV_SETTINGS;

      // Mock setItem to throw error
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => saveDevSettings(settings)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DevTools] Failed to save settings to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearDevSettings', () => {
    it('should remove settings from localStorage', () => {
      localStorageMock['plinko-dev-settings'] = JSON.stringify(DEFAULT_DEV_SETTINGS);

      clearDevSettings();

      expect(localStorage.removeItem).toHaveBeenCalledWith('plinko-dev-settings');
      expect(localStorageMock['plinko-dev-settings']).toBeUndefined();
    });

    it('should handle removal errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      // Should not throw
      expect(() => clearDevSettings()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DevTools] Failed to clear settings from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('round-trip persistence', () => {
    it('should correctly save and load settings', () => {
      const originalSettings: DevToolsSettings = {
        choiceMechanic: 'drop-position',
        showWinner: true,
        musicEnabled: true,
        performanceMode: 'high-quality',
        viewportWidth: 414,
        themeName: 'sunset',
      };

      saveDevSettings(originalSettings);
      const loadedSettings = loadDevSettings();

      expect(loadedSettings).toEqual(originalSettings);
    });

    it('should handle multiple save/load cycles', () => {
      const settings1: DevToolsSettings = {
        ...DEFAULT_DEV_SETTINGS,
        choiceMechanic: 'none',
        musicEnabled: true,
      };

      const settings2: DevToolsSettings = {
        ...DEFAULT_DEV_SETTINGS,
        performanceMode: 'power-saving',
        viewportWidth: 360,
      };

      // First cycle
      saveDevSettings(settings1);
      let loaded = loadDevSettings();
      expect(loaded).toEqual(settings1);

      // Second cycle
      saveDevSettings(settings2);
      loaded = loadDevSettings();
      expect(loaded).toEqual(settings2);
    });
  });
});
