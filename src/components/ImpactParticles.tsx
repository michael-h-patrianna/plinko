/**
 * Impact particles for peg collisions - Disney Secondary Action principle
 * Spawns and animates particles when ball hits pegs with gravity physics
 * @param pegHit - Whether a peg was hit (triggers particle spawn)
 * @param pegX - X position of peg hit
 * @param pegY - Y position of peg hit
 * @param reset - Signal to clear all active particles
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../theme';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0-1, decreases over time
  size: number;
}

interface ImpactParticlesProps {
  pegHit: boolean;
  pegX?: number;
  pegY?: number;
  reset?: boolean; // Signal to clear all particles
}

export function ImpactParticles({ pegHit, pegX, pegY, reset }: ImpactParticlesProps) {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleIdCounter, setParticleIdCounter] = useState(0);

  // Reset particles when requested
  useEffect(() => {
    if (reset) {
      setParticles([]);
    }
  }, [reset]);

  // Spawn particles on peg hit
  useEffect(() => {
    if (pegHit && pegX !== undefined && pegY !== undefined) {
      const newParticles: Particle[] = [];
      const particleCount = 5; // 5 particles per impact
      const baseId = particleIdCounter;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = 50 + Math.random() * 50; // Random speed 50-100

        newParticles.push({
          id: baseId + i,
          x: pegX,
          y: pegY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: 3 + Math.random() * 3, // 3-6px
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
      setParticleIdCounter((prev) => prev + particleCount);
    }
  }, [pegHit, pegX, pegY, particleIdCounter]);

  // Animate particles (physics simulation)
  useEffect(() => {
    if (particles.length === 0) return;

    const GRAVITY = 300; // Particles fall
    const dt = 1 / 60;
    const LIFE_DECAY = 0.02; // Fade out speed

    const interval = setInterval(() => {
      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            vy: p.vy + GRAVITY * dt, // Apply gravity
            life: p.life - LIFE_DECAY,
          }))
          .filter((p) => p.life > 0); // Remove dead particles
      });
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [particles.length]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, ${theme.colors.game.ball.primary}${Math.round(
              p.life * 255
            )
              .toString(16)
              .padStart(2, '0')} 0%, ${theme.colors.game.ball.secondary}${Math.round(
              p.life * 0.6 * 255
            )
              .toString(16)
              .padStart(2, '0')} 50%, transparent 100%)`,
            transform: `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${theme.colors.game.ball.primary}${Math.round(
              p.life * 0.8 * 255
            )
              .toString(16)
              .padStart(2, '0')}`,
            zIndex: 22,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
}
