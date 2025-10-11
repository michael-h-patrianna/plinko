/**
 * Test: Collision Detection Cooldown
 *
 * Verifies that the cooldown mechanism prevents duplicate peg collision detections
 * across consecutive frames when the ball remains near the same peg.
 */

import { describe, it, expect } from 'vitest';
import { detectAndHandlePegCollisions } from '../../../game/trajectory/collision';
import { PHYSICS, type Peg } from '../../../game/boardGeometry';
import { createRng } from '../../../game/rng';

describe('Collision Detection Cooldown', () => {
  it('should not report the same peg hit in consecutive frames within cooldown period', () => {
    // Setup: Single peg at center
    const peg: Peg = { row: 0, col: 0, x: 100, y: 100 };
    const pegs = [peg];
    const rng = createRng(12345);
    const recentCollisions = new Map<string, number>();

    // Frame 0: Ball collides with peg (direct hit)
    const result1 = detectAndHandlePegCollisions({
      state: { x: 100, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 0, vy: 10 },
      oldState: { x: 100, y: 95, vx: 0, vy: 10 },
      pegs,
      recentCollisions,
      frame: 0,
      bounceRandomness: 0.1,
      rng,
    });

    // Should detect collision and add to pegsHit on the first hit
    // The collision gets recorded in recentCollisions with frame=0
    // Visual feedback pass sees lastHit=0 and frame=0, so lastHit === frame is true
    expect(result1.pegsHit).toHaveLength(1);
    expect(result1.pegsHit[0]).toEqual({ row: 0, col: 0 });

    // Frame 1: Ball still near peg (within cooldown period)
    // Ball position is slightly away but still within detection radius
    const result2 = detectAndHandlePegCollisions({
      state: { x: 102, y: 100 - PHYSICS.COLLISION_RADIUS + 1, vx: 0.5, vy: 5 },
      oldState: { x: 101, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 0.5, vy: 5 },
      pegs,
      recentCollisions,
      frame: 1,
      bounceRandomness: 0.1,
      rng,
    });

    // Should NOT add peg to pegsHit (within cooldown)
    expect(result2.pegsHit).toHaveLength(0);

    // Frame 9: Ball still near peg (within cooldown period)
    const result3 = detectAndHandlePegCollisions({
      state: { x: 104, y: 100 - PHYSICS.COLLISION_RADIUS + 2, vx: 1, vy: 3 },
      oldState: { x: 103, y: 100 - PHYSICS.COLLISION_RADIUS + 1, vx: 1, vy: 3 },
      pegs,
      recentCollisions,
      frame: 9,
      bounceRandomness: 0.1,
      rng,
    });

    // Should NOT add peg to pegsHit (still within 10-frame cooldown)
    expect(result3.pegsHit).toHaveLength(0);

    // Frame 10: Ball still near peg (cooldown expired)
    const result4 = detectAndHandlePegCollisions({
      state: { x: 106, y: 100 - PHYSICS.COLLISION_RADIUS + 3, vx: 1.5, vy: 2 },
      oldState: { x: 105, y: 100 - PHYSICS.COLLISION_RADIUS + 2, vx: 1.5, vy: 2 },
      pegs,
      recentCollisions,
      frame: 10,
      bounceRandomness: 0.1,
      rng,
    });

    // Should add peg to pegsHit (cooldown expired after 10 frames)
    expect(result4.pegsHit).toHaveLength(1);
    expect(result4.pegsHit[0]).toEqual({ row: 0, col: 0 });
  });

  it('should allow different pegs to be detected simultaneously', () => {
    // Setup: Two pegs
    const peg1: Peg = { row: 0, col: 0, x: 100, y: 100 };
    const peg2: Peg = { row: 0, col: 1, x: 130, y: 100 };
    const pegs = [peg1, peg2];
    const rng = createRng(12345);
    const recentCollisions = new Map<string, number>();

    // Frame 0: Ball hits peg1
    const result1 = detectAndHandlePegCollisions({
      state: { x: 100, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 5, vy: 10 },
      oldState: { x: 98, y: 95, vx: 5, vy: 10 },
      pegs,
      recentCollisions,
      frame: 0,
      bounceRandomness: 0.1,
      rng,
    });

    // Should detect peg1 only
    expect(result1.pegsHit).toHaveLength(1);
    expect(result1.pegsHit[0]).toEqual({ row: 0, col: 0 });

    // Frame 5: Ball moves and hits peg2 (peg1 still on cooldown)
    const result2 = detectAndHandlePegCollisions({
      state: { x: 130, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 5, vy: 10 },
      oldState: { x: 128, y: 98, vx: 5, vy: 10 },
      pegs,
      recentCollisions,
      frame: 5,
      bounceRandomness: 0.1,
      rng,
    });

    // Should detect peg2 only (peg1 is on cooldown)
    expect(result2.pegsHit).toHaveLength(1);
    expect(result2.pegsHit[0]).toEqual({ row: 0, col: 1 });
  });

  it('should track cooldowns independently for each peg', () => {
    // Setup: Three pegs in a row
    const peg1: Peg = { row: 0, col: 0, x: 100, y: 100 };
    const peg2: Peg = { row: 0, col: 1, x: 130, y: 100 };
    const peg3: Peg = { row: 0, col: 2, x: 160, y: 100 };
    const pegs = [peg1, peg2, peg3];
    const rng = createRng(12345);
    const recentCollisions = new Map<string, number>();

    // Hit pegs in sequence with different timing
    detectAndHandlePegCollisions({
      state: { x: 100, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 5, vy: 10 },
      oldState: { x: 98, y: 95, vx: 5, vy: 10 },
      pegs,
      recentCollisions,
      frame: 0, // peg1 hit at frame 0
      bounceRandomness: 0.1,
      rng,
    });

    detectAndHandlePegCollisions({
      state: { x: 130, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 5, vy: 10 },
      oldState: { x: 128, y: 98, vx: 5, vy: 10 },
      pegs,
      recentCollisions,
      frame: 5, // peg2 hit at frame 5
      bounceRandomness: 0.1,
      rng,
    });

    detectAndHandlePegCollisions({
      state: { x: 160, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 5, vy: 10 },
      oldState: { x: 158, y: 98, vx: 5, vy: 10 },
      pegs,
      recentCollisions,
      frame: 8, // peg3 hit at frame 8
      bounceRandomness: 0.1,
      rng,
    });

    // Frame 15: Check which pegs are detectable
    const result = detectAndHandlePegCollisions({
      state: { x: 130, y: 100 - PHYSICS.COLLISION_RADIUS + 1, vx: 0, vy: 5 },
      oldState: { x: 130, y: 100 - PHYSICS.COLLISION_RADIUS, vx: 0, vy: 5 },
      pegs,
      recentCollisions,
      frame: 15,
      bounceRandomness: 0.1,
      rng,
    });

    // peg1: last hit at frame 0, cooldown expired (15 - 0 = 15 >= 10) ✓
    // peg2: last hit at frame 5, cooldown expired (15 - 5 = 10 >= 10) ✓
    // peg3: last hit at frame 8, cooldown active (15 - 8 = 7 < 10) ✗

    // Ball is positioned near peg2, which should be detectable now
    expect(result.pegsHit.length).toBeGreaterThan(0);
    expect(result.pegsHit.some(p => p.row === 0 && p.col === 1)).toBe(true);
  });
});
