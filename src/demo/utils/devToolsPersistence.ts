/**
 * DEV TOOLS PERSISTENCE
 *
 * Utilities for persisting dev menu settings to localStorage
 * so they survive page refreshes and rebuilds.
 */

import type { PerformanceMode } from '@demo/config/appConfig';
import type { ChoiceMechanic } from '../components/DevTools/components/DevToolsMenu';

const STORAGE_KEY = 'plinko-dev-settings';

export interface DevToolsSettings {
  choiceMechanic: ChoiceMechanic;
  showWinner: boolean;
  musicEnabled: boolean;
  performanceMode: PerformanceMode;
  viewportWidth: number;
  themeName: string;
}

/**
 * Default dev tools settings
 */
export const DEFAULT_DEV_SETTINGS: DevToolsSettings = {
  choiceMechanic: 'drop-position',
  showWinner: false,
  musicEnabled: false,
  performanceMode: 'high-quality',
  viewportWidth: 375,
  themeName: 'default',
};

/**
 * Load dev tools settings from localStorage
 * Returns default settings if none are saved or if loading fails
 */
export function loadDevSettings(): DevToolsSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_DEV_SETTINGS;
    }

    const parsed: unknown = JSON.parse(stored);

    // Type guard: ensure parsed is an object before accessing properties
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return DEFAULT_DEV_SETTINGS;
    }

    // Cast to record for safe property access
    const data = parsed as Record<string, unknown>;

    // Validate and merge with defaults to handle missing fields
    return {
      choiceMechanic: isValidChoiceMechanic(data.choiceMechanic)
        ? data.choiceMechanic
        : DEFAULT_DEV_SETTINGS.choiceMechanic,
      showWinner:
        typeof data.showWinner === 'boolean' ? data.showWinner : DEFAULT_DEV_SETTINGS.showWinner,
      musicEnabled:
        typeof data.musicEnabled === 'boolean'
          ? data.musicEnabled
          : DEFAULT_DEV_SETTINGS.musicEnabled,
      performanceMode: isValidPerformanceMode(data.performanceMode)
        ? data.performanceMode
        : DEFAULT_DEV_SETTINGS.performanceMode,
      viewportWidth:
        typeof data.viewportWidth === 'number'
          ? data.viewportWidth
          : DEFAULT_DEV_SETTINGS.viewportWidth,
      themeName:
        typeof data.themeName === 'string' ? data.themeName : DEFAULT_DEV_SETTINGS.themeName,
    };
  } catch (error) {
    console.warn('[DevTools] Failed to load settings from localStorage:', error);
    return DEFAULT_DEV_SETTINGS;
  }
}

/**
 * Save dev tools settings to localStorage
 */
export function saveDevSettings(settings: DevToolsSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[DevTools] Failed to save settings to localStorage:', error);
  }
}

/**
 * Clear dev tools settings from localStorage
 */
export function clearDevSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[DevTools] Failed to clear settings from localStorage:', error);
  }
}

/**
 * Type guard for ChoiceMechanic
 */
function isValidChoiceMechanic(value: unknown): value is ChoiceMechanic {
  return value === 'none' || value === 'drop-position';
}

/**
 * Type guard for PerformanceMode
 */
function isValidPerformanceMode(value: unknown): value is PerformanceMode {
  return value === 'high-quality' || value === 'power-saving';
}
