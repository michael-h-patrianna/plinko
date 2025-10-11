import { VolumeSettings } from '../types';

/**
 * Manages volume settings with persistence.
 */
export class VolumeController {
  private masterVolume: number;
  private musicVolume: number;
  private sfxVolume: number;
  private isMutedState: boolean;
  private storageKey: string;

  constructor(
    defaultMasterVolume = 1.0,
    defaultMusicVolume = 0.7,
    defaultSFXVolume = 1.0,
    storageKey = 'plinko-audio-settings'
  ) {
    this.masterVolume = defaultMasterVolume;
    this.musicVolume = defaultMusicVolume;
    this.sfxVolume = defaultSFXVolume;
    this.isMutedState = false;
    this.storageKey = storageKey;
  }

  /**
   * Set master volume (affects all audio).
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = this.clampVolume(volume);
  }

  /**
   * Set music volume (independent control).
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = this.clampVolume(volume);
  }

  /**
   * Set SFX volume (independent control).
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = this.clampVolume(volume);
  }

  /**
   * Get master volume.
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Get music volume.
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get SFX volume.
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Get effective music volume (master * music).
   */
  getEffectiveMusicVolume(): number {
    return this.masterVolume * this.musicVolume;
  }

  /**
   * Get effective SFX volume (master * sfx).
   */
  getEffectiveSFXVolume(): number {
    return this.masterVolume * this.sfxVolume;
  }

  /**
   * Set muted state.
   */
  setMuted(muted: boolean): void {
    this.isMutedState = muted;
  }

  /**
   * Get muted state.
   */
  isMuted(): boolean {
    return this.isMutedState;
  }

  /**
   * Save volume settings to localStorage.
   */
  saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const settings: VolumeSettings = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMutedState,
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  /**
   * Load volume settings from localStorage.
   */
  loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const settings = JSON.parse(stored) as Partial<VolumeSettings>;

        if (settings.masterVolume !== undefined) {
          this.masterVolume = settings.masterVolume;
        }
        if (settings.musicVolume !== undefined) {
          this.musicVolume = settings.musicVolume;
        }
        if (settings.sfxVolume !== undefined) {
          this.sfxVolume = settings.sfxVolume;
        }
        if (settings.isMuted !== undefined) {
          this.isMutedState = settings.isMuted;
        }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  /**
   * Clamp volume between 0 and 1.
   */
  private clampVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
  }
}
