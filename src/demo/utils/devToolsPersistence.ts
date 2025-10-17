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

    const parsed = JSON.parse(stored);

    // Validate and merge with defaults to handle missing fields
    return {
      choiceMechanic: isValidChoiceMechanic(parsed.choiceMechanic)
        ? parsed.choiceMechanic
        : DEFAULT_DEV_SETTINGS.choiceMechanic,
      showWinner: typeof parsed.showWinner === 'boolean'
        ? parsed.showWinner
        : DEFAULT_DEV_SETTINGS.showWinner,
      musicEnabled: typeof parsed.musicEnabled === 'boolean'
        ? parsed.musicEnabled
        : DEFAULT_DEV_SETTINGS.musicEnabled,
      performanceMode: isValidPerformanceMode(parsed.performanceMode)
        ? parsed.performanceMode
        : DEFAULT_DEV_SETTINGS.performanceMode,
      viewportWidth: typeof parsed.viewportWidth === 'number'
        ? parsed.viewportWidth
        : DEFAULT_DEV_SETTINGS.viewportWidth,
      themeName: typeof parsed.themeName === 'string'
        ? parsed.themeName
        : DEFAULT_DEV_SETTINGS.themeName,
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
