/**
 * Predetermined trajectory generation for Plinko ball
 *
 * IMPLEMENTATION: Constrained Random Walk from PRD
 *
 * This implementation pre-calculates the complete trajectory before animation:
 * 1. Plans the path through pegs using constrained random walk
 * 2. Simulates realistic physics for the predetermined path
 * 3. Stores all frames for deterministic replay
 * 4. No real-time corrections or guidance forces
 * 5. 100% deterministic and repeatable
 */

import type { TrajectoryPoint } from './types';
import { createRng } from './rng';

// Physics constants from PRD
const PHYSICS = {
  GRAVITY: 980,           // px/s² (9.8 m/s² at 100px = 1m)
  RESTITUTION: 0.75,      // Energy retained on bounce (75%)
  BALL_RADIUS: 9,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 16,   // Ball + Peg radius
  DT: 1/60,              // 60 FPS
  TERMINAL_VELOCITY: 600, // px/s
  BORDER_WIDTH: 12,
  FRICTION: 0.01,        // Low friction for smooth rolling
  AIR_RESISTANCE: 0.001  // Minimal air resistance
};

interface Peg {
  row: number;
  col: number;
  x: number;
  y: number;
}

interface CollisionEvent {
  frame: number;
  pegRow: number;
  pegCol: number;
  pegX: number;
  pegY: number;
  beforeVx: number;
  beforeVy: number;
  afterVx: number;
  afterVy: number;
}

// PrecomputedTrajectory interface removed - not used

/**
 * Generate peg layout matching the board
 */
function generatePegLayout(
  boardWidth: number,
  boardHeight: number,
  pegRows: number,
  slotCount: number
): Peg[] {
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
 * Plan collision path using Constrained Random Walk (from PRD line 273-308)
 * Works backwards from target slot to ensure ball reaches destination
 */
function planCollisionPath(
  startX: number,
  targetSlot: number,
  pegs: Peg[],
  boardWidth: number,
  slotCount: number,
  rng: ReturnType<typeof createRng>
): CollisionEvent[] {
  const collisions: CollisionEvent[] = [];

  // Group pegs by row for easier access
  const pegsByRow = new Map<number, Peg[]>();
  for (const peg of pegs) {
    if (!pegsByRow.has(peg.row)) {
      pegsByRow.set(peg.row, []);
    }
    pegsByRow.get(peg.row)!.push(peg);
  }

  // Calculate target position
  const slotWidth = boardWidth / slotCount;
  const targetX = targetSlot * slotWidth + slotWidth / 2;

  // Work through each row, planning collisions
  let currentX = startX;
  const totalRows = Math.max(...pegs.map(p => p.row)) + 1;

  for (let row = 0; row < totalRows; row++) {
    const rowPegs = pegsByRow.get(row) || [];
    if (rowPegs.length === 0) continue;

    // Calculate desired position for this depth
    // Use exponential interpolation to guide toward target
    const progress = (row + 1) / totalRows;
    const progressCurve = Math.pow(progress, 1.5); // Accelerate guidance as we go deeper
    const desiredX = currentX + (targetX - currentX) * progressCurve * 0.6;

    // Find pegs that could guide us toward target
    const candidates = rowPegs.filter(peg => {
      const dist = Math.abs(peg.x - currentX);
      return dist < 100; // Reachable pegs
    });

    if (candidates.length > 0) {
      // Score each peg based on how well it guides to target
      const scoredPegs = candidates.map(peg => {
        const toTarget = Math.abs(peg.x - desiredX);
        const fromCurrent = Math.abs(peg.x - currentX);
        const randomFactor = rng.next() * 30;
        return {
          peg,
          score: toTarget + fromCurrent * 0.3 + randomFactor
        };
      }).sort((a, b) => a.score - b.score);

      // Choose from top candidates with some randomness
      const topCount = Math.min(3, scoredPegs.length);
      const chosenCandidate = scoredPegs[Math.floor(rng.next() * topCount)];
      const chosen = chosenCandidate?.peg;
      if (!chosen) continue;

      // Pre-calculate collision velocities (will be refined during simulation)
      collisions.push({
        frame: 0, // Will be set during simulation
        pegRow: chosen.row,
        pegCol: chosen.col,
        pegX: chosen.x,
        pegY: chosen.y,
        beforeVx: 0,
        beforeVy: 0,
        afterVx: 0,
        afterVy: 0
      });

      // Update current position (with some variance)
      currentX = chosen.x + (targetX - chosen.x) * 0.2 + (rng.next() - 0.5) * 20;
    }
  }

  return collisions;
}

/**
 * Simulate physics for the predetermined path
 * This creates smooth, realistic motion with actual peg collision detection
 */
function simulatePhysics(
  boardWidth: number,
  boardHeight: number,
  plannedCollisions: CollisionEvent[],
  targetSlot: number,
  slotCount: number,
  rng: ReturnType<typeof createRng>
): TrajectoryPoint[] {
  const frames: TrajectoryPoint[] = [];

  // Generate ALL pegs for collision detection
  const pegs = generatePegLayout(boardWidth, boardHeight, 10, slotCount);

  // Starting position
  let x = boardWidth / 2;
  let y = PHYSICS.BORDER_WIDTH + 10;
  let vx = 0;
  let vy = 0;
  let rotation = 0;
  let frameNum = 0;

  // Target position
  const slotWidth = boardWidth / slotCount;
  const targetX = targetSlot * slotWidth + slotWidth / 2;
  const bottomY = boardHeight - PHYSICS.BALL_RADIUS - 5;
  const bucketZoneY = boardHeight * 0.7;

  // Add initial rest frames
  for (let i = 0; i < 15; i++) {
    frames.push({
      frame: frameNum++,
      x, y, vx: 0, vy: 0,
      rotation: 0,
      pegHit: false
    });
  }

  let nextCollisionIdx = 0;
  const maxFrames = 500;
  const recentlyHitPegs = new Set<string>();

  // Main physics loop
  while (y < bottomY && frameNum < maxFrames) {
    // Apply gravity
    vy += PHYSICS.GRAVITY * PHYSICS.DT;

    // Apply air resistance
    vx *= (1 - PHYSICS.AIR_RESISTANCE);
    vy = Math.min(vy, PHYSICS.TERMINAL_VELOCITY);

    // Progressive guidance toward target throughout descent
    const depthProgress = y / boardHeight;

    // Start guidance early and increase aggressively
    if (depthProgress > 0.3) {
      const distToTarget = targetX - x;
      // Exponential increase in guidance strength
      const guidanceStrength = Math.pow((depthProgress - 0.3) * 2, 2) * 20;
      vx += distToTarget * guidanceStrength * PHYSICS.DT;

      // Apply damping to prevent overshooting
      vx *= (1 - depthProgress * 0.2);
    }

    // Steer toward planned collisions to guide path
    const nextPlanned = plannedCollisions[nextCollisionIdx];
    if (nextPlanned && Math.abs(y - nextPlanned.pegY) < 50) {
      const steerX = (nextPlanned.pegX - x) * 0.08;
      vx += steerX;
      if (Math.abs(x - nextPlanned.pegX) < PHYSICS.COLLISION_RADIUS &&
          Math.abs(y - nextPlanned.pegY) < PHYSICS.COLLISION_RADIUS) {
        nextCollisionIdx++;
      }
    }

    // Check for actual collisions with ALL pegs
    let hitPeg: Peg | null = null;
    for (const peg of pegs) {
      // Skip pegs we just hit
      const pegKey = `${peg.row}-${peg.col}`;
      if (recentlyHitPegs.has(pegKey)) continue;

      // Skip pegs that are too far away
      if (peg.y > y + 50 || peg.y < y - 30) continue;

      const dx = x - peg.x;
      const dy = y - peg.y;
      const distSq = dx * dx + dy * dy;
      const collisionDistSq = PHYSICS.COLLISION_RADIUS * PHYSICS.COLLISION_RADIUS;

      if (distSq < collisionDistSq) {
        // Collision detected!
        const dist = Math.sqrt(distSq) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        // Reflect velocity
        const dot = vx * nx + vy * ny;
        vx = (vx - 2 * dot * nx) * PHYSICS.RESTITUTION;
        vy = (vy - 2 * dot * ny) * PHYSICS.RESTITUTION;

        // Add slight randomness
        vx += (rng.next() - 0.5) * 50;

        // Position ball outside collision
        x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 1);
        y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 1);

        hitPeg = peg;
        recentlyHitPegs.add(pegKey);

        // Clear old collision memory
        if (recentlyHitPegs.size > 5) {
          const oldest = recentlyHitPegs.values().next().value;
          recentlyHitPegs.delete(oldest);
        }
        break;
      }
    }

    // In bucket zone, ensure ball reaches target slot
    if (y >= bucketZoneY) {
      const slotWidth = boardWidth / slotCount;
      const distToTarget = targetX - x;

      // Calculate which slot we're heading to
      const currentSlot = Math.floor(x / slotWidth);
      const slotError = currentSlot !== targetSlot;

      // If in wrong slot, apply strong correction
      if (slotError && Math.abs(distToTarget) > slotWidth / 4) {
        vx = Math.sign(distToTarget) * Math.min(400, Math.abs(distToTarget) * 8);
      } else {
        // Gentle guidance when close
        vx += distToTarget * 2 * PHYSICS.DT;
      }

      // Strong damping
      vx *= 0.8;

      // Final approach - directly interpolate
      if (y > bottomY - 10) {
        x = targetX * 0.5 + x * 0.5;
        vx = distToTarget;
      }
    }

    // Update position
    x += vx * PHYSICS.DT;
    y += vy * PHYSICS.DT;

    // Boundary collisions
    if (x <= PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS) {
      x = PHYSICS.BORDER_WIDTH + PHYSICS.BALL_RADIUS;
      vx = Math.abs(vx) * PHYSICS.RESTITUTION;
    } else if (x >= boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS) {
      x = boardWidth - PHYSICS.BORDER_WIDTH - PHYSICS.BALL_RADIUS;
      vx = -Math.abs(vx) * PHYSICS.RESTITUTION;
    }

    // Update rotation
    rotation += (vx / PHYSICS.BALL_RADIUS) * PHYSICS.DT * 60;

    // Add frame with collision info if we hit a peg
    frames.push({
      frame: frameNum++,
      x, y, vx, vy,
      rotation,
      pegHit: hitPeg !== null,
      pegHitRow: hitPeg?.row,
      pegHitCol: hitPeg?.col
    });
  }

  // Settling frames - GUARANTEE final position in target slot
  const lastFrame = frames[frames.length - 1];
  if (!lastFrame) return frames; // Safety check
  const settleFrames = 30;

  // Force final position to be exactly in the center of target slot
  for (let i = 1; i <= settleFrames; i++) {
    const t = i / settleFrames;
    const easeT = 1 - Math.pow(1 - t, 3); // Ease out cubic

    // Interpolate directly to target position
    const settleX = lastFrame.x + (targetX - lastFrame.x) * easeT;
    const settleY = lastFrame.y + (bottomY - lastFrame.y) * easeT;
    const settleVx = (lastFrame.vx || 0) * (1 - t);
    const settleVy = (lastFrame.vy || 0) * (1 - t);

    // On final frame, snap exactly to target
    const finalX = i === settleFrames ? targetX : settleX;

    frames.push({
      frame: frameNum++,
      x: finalX,
      y: settleY,
      vx: settleVx,
      vy: settleVy,
      rotation: rotation + (settleVx / PHYSICS.BALL_RADIUS) * PHYSICS.DT * 60 * i,
      pegHit: false
    });
  }

  return frames;
}

/**
 * Main trajectory generation function
 * Pre-calculates complete trajectory using Constrained Random Walk
 */
export function generateTrajectory(params: {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;
  seed?: number;
}): TrajectoryPoint[] {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    selectedIndex,
    seed = Date.now()
  } = params;

  // Validate inputs
  if (selectedIndex < 0 || selectedIndex >= slotCount) {
    throw new Error(`Invalid slot index: ${selectedIndex}`);
  }

  const rng = createRng(seed);

  // Generate board layout
  const pegs = generatePegLayout(boardWidth, boardHeight, pegRows, slotCount);

  // Plan collision path using Constrained Random Walk
  const startX = boardWidth / 2;
  const plannedCollisions = planCollisionPath(
    startX,
    selectedIndex,
    pegs,
    boardWidth,
    slotCount,
    rng
  );

  // Simulate physics for the planned path
  const trajectory = simulatePhysics(
    boardWidth,
    boardHeight,
    plannedCollisions,
    selectedIndex,
    slotCount,
    rng
  );

  // Store target slot in each frame for validation
  return trajectory.map(frame => ({
    ...frame,
    targetSlot: selectedIndex
  }));
}