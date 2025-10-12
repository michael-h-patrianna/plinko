/**
 * SoundToggle - Simple white icon that mutes/unmutes all audio
 * Just a clickable icon, no button chrome
 */

import { useAudio } from '@/audio/context/AudioProvider';
import soundOffIcon from '@/assets/images/sound-off.svg';
import soundOnIcon from '@/assets/images/sound-on.svg';
import { useCallback, useEffect, useState } from 'react';

export function SoundToggle() {
  const { volumeController, audioAdapter, isInitialized } = useAudio();
  const [isMuted, setIsMuted] = useState(false);

  // Sync with volumeController on init
  useEffect(() => {
    if (isInitialized && volumeController) {
      const savedMuted = volumeController.isMuted();
      setIsMuted(savedMuted);
      if (audioAdapter) {
        if (savedMuted) {
          audioAdapter.mute();
        } else {
          audioAdapter.unmute();
        }
      }
    }
  }, [isInitialized, volumeController, audioAdapter]);

  const handleClick = useCallback(() => {
    if (!volumeController || !audioAdapter) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);

    volumeController.setMuted(newMuted);
    volumeController.saveToStorage();

    if (newMuted) {
      audioAdapter.mute();
    } else {
      audioAdapter.unmute();
    }
  }, [volumeController, audioAdapter, isMuted]);

  if (!isInitialized) return null;

  return (
    <button
      onClick={handleClick}
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      aria-pressed={isMuted}
      data-testid="sound-toggle"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        width: '28px',
        height: '28px',
        position: 'relative',
        opacity: 0.85,
        transition: 'opacity 0.2s, transform 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <img
        src={isMuted ? soundOffIcon : soundOnIcon}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          filter: 'brightness(0) invert(1)',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}
