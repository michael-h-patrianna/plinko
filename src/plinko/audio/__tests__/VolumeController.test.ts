/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VolumeController } from '../core/VolumeController';

describe('VolumeController', () => {
  let controller: VolumeController;

  beforeEach(() => {
    controller = new VolumeController(1.0, 0.7, 1.0, 'test-audio-settings');
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default volumes', () => {
    expect(controller.getMasterVolume()).toBe(1.0);
    expect(controller.getMusicVolume()).toBe(0.7);
    expect(controller.getSFXVolume()).toBe(1.0);
    expect(controller.isMuted()).toBe(false);
  });

  it('should set and get volumes', () => {
    controller.setMasterVolume(0.5);
    controller.setMusicVolume(0.3);
    controller.setSFXVolume(0.8);

    expect(controller.getMasterVolume()).toBe(0.5);
    expect(controller.getMusicVolume()).toBe(0.3);
    expect(controller.getSFXVolume()).toBe(0.8);
  });

  it('should clamp volumes to 0-1 range', () => {
    controller.setMasterVolume(1.5);
    expect(controller.getMasterVolume()).toBe(1.0);

    controller.setMusicVolume(-0.5);
    expect(controller.getMusicVolume()).toBe(0.0);
  });

  it('should calculate effective volumes', () => {
    controller.setMasterVolume(0.8);
    controller.setMusicVolume(0.5);
    controller.setSFXVolume(0.75);

    expect(controller.getEffectiveMusicVolume()).toBe(0.4); // 0.8 * 0.5
    expect(controller.getEffectiveSFXVolume()).toBeCloseTo(0.6, 10); // 0.8 * 0.75
  });

  it('should set and get muted state', () => {
    controller.setMuted(true);
    expect(controller.isMuted()).toBe(true);

    controller.setMuted(false);
    expect(controller.isMuted()).toBe(false);
  });

  it('should save settings to localStorage', () => {
    controller.setMasterVolume(0.5);
    controller.setMusicVolume(0.3);
    controller.setSFXVolume(0.7);
    controller.setMuted(true);

    controller.saveToStorage();

    const stored = localStorage.getItem('test-audio-settings');
    expect(stored).toBeTruthy();

    interface StoredSettings {
      masterVolume: number;
      musicVolume: number;
      sfxVolume: number;
      isMuted: boolean;
    }

    const settings = JSON.parse(stored!) as StoredSettings;
    expect(settings.masterVolume).toBe(0.5);
    expect(settings.musicVolume).toBe(0.3);
    expect(settings.sfxVolume).toBe(0.7);
    expect(settings.isMuted).toBe(true);
  });

  it('should load settings from localStorage', () => {
    const settings = {
      masterVolume: 0.4,
      musicVolume: 0.2,
      sfxVolume: 0.6,
      isMuted: true,
    };
    localStorage.setItem('test-audio-settings', JSON.stringify(settings));

    controller.loadFromStorage();

    expect(controller.getMasterVolume()).toBe(0.4);
    expect(controller.getMusicVolume()).toBe(0.2);
    expect(controller.getSFXVolume()).toBe(0.6);
    expect(controller.isMuted()).toBe(true);
  });

  it('should handle missing localStorage gracefully', () => {
    const originalLocalStorage = global.localStorage;
    // @ts-expect-error - intentionally deleting for test
    delete global.localStorage;

    expect(() => controller.saveToStorage()).not.toThrow();
    expect(() => controller.loadFromStorage()).not.toThrow();

    global.localStorage = originalLocalStorage;
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('test-audio-settings', 'invalid json');

    controller.loadFromStorage();

    // Should keep default values
    expect(controller.getMasterVolume()).toBe(1.0);
    expect(controller.getMusicVolume()).toBe(0.7);
  });

  it('should handle partial settings in localStorage', () => {
    const partialSettings = {
      masterVolume: 0.6,
      // musicVolume missing
      sfxVolume: 0.8,
      // isMuted missing
    };
    localStorage.setItem('test-audio-settings', JSON.stringify(partialSettings));

    controller.loadFromStorage();

    expect(controller.getMasterVolume()).toBe(0.6);
    expect(controller.getMusicVolume()).toBe(0.7); // Default preserved
    expect(controller.getSFXVolume()).toBe(0.8);
    expect(controller.isMuted()).toBe(false); // Default preserved
  });
});
