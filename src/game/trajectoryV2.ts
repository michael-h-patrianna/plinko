/**
 * TRUE Predetermined Trajectory Generation
 *
 * This implementation:
 * 1. Simulates multiple possible trajectories
 * 2. Finds one that lands in the correct slot
 * 3. Returns that predetermined path for replay
 *
 * No real-time guidance or forcing - the path is completely determined in advance
 */

import type { TrajectoryPoint } from './types';
import { createRng } from './rng';

const PHYSICS = {
  GRAVITY: 980,
  RESTITUTION: 0.75,
  BALL_RADIUS: 9,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 16,
  DT: 1/60,
  TERMINAL_VELOCITY: 600,
  BORDER_WIDTH: 12,
};

interface Peg {
  row: number;
  col: number;
  x: number;
  y: number;
}

function generatePegs(boardWidth: number, boardHeight: number, pegRows: number, slotCount: number): Peg[] {
  const pegs: Peg[] = [];
  const playableWidth = boardWidth - (PHYSICS.BORDER_WIDTH * 2);
  const playableHeight = boardHeight * 0.65;
  const verticalSpacing = playableHeight / (pegRows + 1);
  const horizontalSpacing = playableWidth / slotCount;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + 20;
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? slotCount : slotCount + 1;

    for (let col = 0; col < numPegs; col++) {
      const x = PHYSICS.BORDER_WIDTH + horizontalSpacing * col + offset;
      pegs.push({ row, col, x, y });
    }
  }
  return pegs;
}

/**
 * Simulate a single trajectory with given initial conditions
 */
function simulateTrajectory(
  startX: number,
  startVx: number,
  boardWidth: number,
  boardHeight: number,
  pegs: Peg[],
  slotCount: number,
  rng: ReturnType<typeof createRng>
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];
  const slotWidth = boardWidth / slotCount;
  const bottomY = boardHeight - PHYSICS.BALL_RADIUS - 5;

  let x = startX;
  let y = PHYSICS.BORDER_WIDTH + 10;
  let vx = startVx;
  let vy = 0;
  let rotation = 0;
  let frame = 0;

  const recentCollisions = new Set<string>();

  // Add rest frames
  for (let i = 0; i < 15; i++) {
    trajectory.push({
      frame: frame++,
      x, y, vx: 0, vy: 0,
      rotation: 0,
      pegHit: false
    });
  }

  // Main simulation
  while (y < bottomY && frame < 600) {
    // Gravity
    vy += PHYSICS.GRAVITY * PHYSICS.DT;
    vy = Math.min(vy, PHYSICS.TERMINAL_VELOCITY);
    vx *= 0.999; // Air resistance

    // Check peg collisions
    let hitPeg: Peg | null = null;
    for (const peg of pegs) {
      if (Math.abs(peg.y - y) > 50) continue;

      const pegKey = `${peg.row}-${peg.col}`;
      if (recentCollisions.has(pegKey)) continue;

      const dx = x - peg.x;
      const dy = y - peg.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < PHYSICS.COLLISION_RADIUS * PHYSICS.COLLISION_RADIUS) {
        const dist = Math.sqrt(distSq) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        const dot = vx * nx + vy * ny;

        if (dot > 0) {
          // Bounce
          vx = (vx - 2 * dot * nx) * PHYSICS.RESTITUTION;
          vy = (vy - 2 * dot * ny) * PHYSICS.RESTITUTION;

          // Add randomness
          vx += (rng.next() - 0.5) * 60;

          // Separate
          x += nx * 2;
          y += ny * 2;

          hitPeg = peg;
          recentCollisions.add(pegKey);
          break;
        }
      }
    }

    // Clean old collisions
    if (recentCollisions.size > 5) {
      const first = recentCollisions.values().next().value;
      recentCollisions.delete(first);
    }

    // Update position
    x += vx * PHYSICS.DT;
    y += vy * PHYSICS.DT;

    // Wall bounces
    if (x <= PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS) {
      x = PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS;
      vx = Math.abs(vx) * PHYSICS.RESTITUTION;
    } else if (x >= boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS) {
      x = boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS;
      vx = -Math.abs(vx) * PHYSICS.RESTITUTION;
    }

    rotation += (vx / PHYSICS.BALL_RADIUS) * PHYSICS.DT * 60;

    trajectory.push({
      frame: frame++,
      x, y, vx, vy,
      rotation,
      pegHit: hitPeg !== null,
      pegHitRow: hitPeg?.row,
      pegHitCol: hitPeg?.col
    });
  }

  // Determine final slot
  const finalSlot = Math.floor(x / slotWidth);

  return trajectory.map(point => ({
    ...point,
    targetSlot: finalSlot
  }));
}

/**
 * Find a trajectory that lands in the target slot
 */
export function generateTrajectoryV2(params: {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;
  seed?: number;
}): TrajectoryPoint[] {
  const { boardWidth, boardHeight, pegRows, slotCount, selectedIndex, seed = Date.now() } = params;

  const pegs = generatePegs(boardWidth, boardHeight, pegRows, slotCount);
  const slotWidth = boardWidth / slotCount;
  const targetX = selectedIndex * slotWidth + slotWidth / 2;

  let rng = createRng(seed);
  let attempts = 0;
  const maxAttempts = 100;

  // Try different initial conditions until we find one that works
  while (attempts < maxAttempts) {
    attempts++;

    // Vary starting position and velocity
    const startX = targetX + (rng.next() - 0.5) * slotWidth * 2;
    const startVx = (targetX - startX) * (rng.next() * 2);

    const trajectory = simulateTrajectory(
      startX,
      startVx,
      boardWidth,
      boardHeight,
      pegs,
      slotCount,
      rng
    );

    // Check if it landed in the correct slot
    const lastPoint = trajectory[trajectory.length - 1];
    if (lastPoint) {
      const landedSlot = Math.floor(lastPoint.x / slotWidth);
      if (landedSlot === selectedIndex) {
        // Success! Return this trajectory
        return trajectory.map(point => ({
          ...point,
          targetSlot: selectedIndex
        }));
      }
    }
  }

  // Fallback: If no natural trajectory found, create a forced one
  // This ensures 100% reliability even in edge cases
  return createForcedTrajectory(
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    selectedIndex,
    pegs,
    rng
  );
}

/**
 * Create a forced trajectory as fallback
 */
function createForcedTrajectory(
  boardWidth: number,
  boardHeight: number,
  pegRows: number,
  slotCount: number,
  targetSlot: number,
  pegs: Peg[],
  rng: ReturnType<typeof createRng>
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];
  const slotWidth = boardWidth / slotCount;
  const targetX = targetSlot * slotWidth + slotWidth / 2;
  const bottomY = boardHeight - PHYSICS.BALL_RADIUS - 5;

  let x = boardWidth / 2;
  let y = PHYSICS.BORDER_WIDTH + 10;
  let frame = 0;

  // Rest frames
  for (let i = 0; i < 15; i++) {
    trajectory.push({
      frame: frame++,
      x, y, vx: 0, vy: 0,
      rotation: 0,
      pegHit: false,
      targetSlot
    });
  }

  // Create path segments between peg rows
  const rowHeight = (boardHeight * 0.65) / (pegRows + 1);

  for (let row = 0; row <= pegRows; row++) {
    const targetY = row * rowHeight + PHYSICS.BORDER_WIDTH + 20;
    const progress = row / pegRows;
    const intermediateX = x + (targetX - x) * progress * 0.5;

    // Animate to this position
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      y = y + (targetY - y) * t * 0.2;
      x = x + (intermediateX - x) * t * 0.3;

      // Check for nearby pegs
      let hitPeg = false;
      let hitRow, hitCol;
      for (const peg of pegs) {
        const dist = Math.sqrt(Math.pow(x - peg.x, 2) + Math.pow(y - peg.y, 2));
        if (dist < PHYSICS.COLLISION_RADIUS * 1.5) {
          hitPeg = true;
          hitRow = peg.row;
          hitCol = peg.col;
          // Bounce away
          x += (x - peg.x) * 0.1;
          break;
        }
      }

      trajectory.push({
        frame: frame++,
        x, y,
        vx: (intermediateX - x) * 2,
        vy: PHYSICS.GRAVITY * PHYSICS.DT * frame,
        rotation: frame * 2,
        pegHit: hitPeg,
        pegHitRow: hitRow,
        pegHitCol: hitCol,
        targetSlot
      });
    }
  }

  // Final descent to target
  while (y < bottomY) {
    y += 5;
    x = x + (targetX - x) * 0.1;
    trajectory.push({
      frame: frame++,
      x, y,
      vx: (targetX - x),
      vy: 100,
      rotation: frame * 2,
      pegHit: false,
      targetSlot
    });
  }

  return trajectory;
}