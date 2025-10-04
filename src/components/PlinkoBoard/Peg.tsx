/**
 * Individual peg component - pinball machine style brief flash
 */

import React, { useEffect, useState, useRef } from 'react';

interface PegProps {
  row: number;
  col: number;
  x: number;
  y: number;
  isActive?: boolean;
  shouldReset?: boolean;
  radius?: number;
}

export function Peg({ row, col, x, y, isActive = false, shouldReset = false, radius = 7 }: PegProps) {
  const pegSize = radius * 2; // diameter
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const lastActiveRef = useRef(false);
  const activeTimeoutRef = useRef<number | null>(null);

  // Reset when new ball drop starts
  useEffect(() => {
    if (shouldReset) {
      setIsFlashing(false);
      setFlashKey(0);
      lastActiveRef.current = false;
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
        activeTimeoutRef.current = null;
      }
    }
  }, [shouldReset]);

  // Trigger brief flash animation when peg is hit
  // Use useEffect with a ref to catch EVERY transition from false->true
  useEffect(() => {
    // Detect rising edge: was false, now true
    if (isActive && !lastActiveRef.current) {
      // Peg was just hit this frame!
      console.log(`🎯 Peg (${row}, ${col}) HIT DETECTED - isActive changed to true`);

      // ALWAYS increment flash key to trigger new animation
      setFlashKey(prev => prev + 1);
      setIsFlashing(true);

      // Clear any existing timeout to reset the animation duration
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }

      // Flash lasts 300ms (extended to handle rapid successive hits better)
      activeTimeoutRef.current = window.setTimeout(() => {
        setIsFlashing(false);
        activeTimeoutRef.current = null;
      }, 300);
    }

    // Update ref for next render
    lastActiveRef.current = isActive;
  }); // Run on EVERY render to catch all transitions

  return (
    <>
      {/* Expanding pulse ring when hit - no blur, React Native compatible */}
      {isFlashing && (
        <div
          key={flashKey}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: '14px',
            height: '14px',
            transform: 'translate(-50%, -50%)',
            border: '2px solid rgba(251,191,36,0.9)',
            animation: 'pulseRing 300ms ease-out',
            zIndex: 15
          }}
        />
      )}

      {/* Peg itself - lights up briefly then smoothly turns off */}
      <div
        className="absolute rounded-full"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '14px',
          height: '14px',
          transform: 'translate(-50%, -50%)',
          background: isFlashing
            ? 'radial-gradient(circle at 35% 35%, #fef3c7, #fde047, #facc15, #eab308)' // YELLOW
            : 'radial-gradient(circle at 35% 35%, #f1f5f9, #cbd5e1, #94a3b8, #64748b)', // GRAY
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.4),
            0 4px 12px rgba(0,0,0,0.2),
            inset -1px -1px 2px rgba(0,0,0,0.3),
            inset 1px 1px 2px rgba(255,255,255,0.6)
          `,
          border: '1px solid rgba(148, 163, 184, 0.3)',
          transition: 'background 150ms ease-out',
          zIndex: 10
        }}
        data-testid={`peg-${row}-${col}`}
        data-peg-hit={isActive}
      />

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            border-width: 3px;
          }
          40% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0.7;
            border-width: 2px;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
            border-width: 1px;
          }
        }
      `}</style>
    </>
  );
}
