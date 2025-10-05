/**
 * Web Worker for trajectory generation
 * Moves expensive trajectory computation off the main thread to prevent UI freezes
 * Implements timeout watchdog and telemetry
 */

import type { TrajectoryPoint } from '../game/types';
import { generateTrajectory } from '../game/trajectory';

console.log('[Worker] Trajectory worker loaded successfully');

export interface TrajectoryWorkerRequest {
  type: 'generate';
  payload: {
    boardWidth: number;
    boardHeight: number;
    pegRows: number;
    slotCount: number;
    seed?: number;
    timeout?: number; // Optional timeout in ms
  };
}

export interface TrajectoryWorkerResponse {
  type: 'success' | 'error' | 'timeout';
  trajectory?: TrajectoryPoint[];
  landedSlot?: number;
  error?: string;
  telemetry?: {
    duration: number;
    attempts?: number;
  };
}

// Listen for messages from main thread
self.onmessage = (event: MessageEvent<TrajectoryWorkerRequest>) => {
  console.log('[Worker] Received message:', event.data.type);
  const { payload } = event.data;

  // Handle trajectory generation request
  console.log('[Worker] Starting trajectory generation...');
  const startTime = performance.now();
  const timeout = payload.timeout || 10000; // Default 10s timeout

    // Set up timeout watchdog
    const timeoutId = setTimeout(() => {
      const response: TrajectoryWorkerResponse = {
        type: 'timeout',
        error: `Trajectory generation timed out after ${timeout}ms`,
        telemetry: {
          duration: performance.now() - startTime,
        },
      };
      self.postMessage(response);
    }, timeout);

    try {
      console.log('[Worker] Calling generateTrajectory...');
      // Generate trajectory
      const { trajectory, landedSlot } = generateTrajectory({
        boardWidth: payload.boardWidth,
        boardHeight: payload.boardHeight,
        pegRows: payload.pegRows,
        slotCount: payload.slotCount,
        seed: payload.seed,
      });
      console.log('[Worker] Trajectory generated, sending response...');

      // Clear timeout since we succeeded
      clearTimeout(timeoutId);

      const duration = performance.now() - startTime;

      // Send success response with telemetry
      const response: TrajectoryWorkerResponse = {
        type: 'success',
        trajectory,
        landedSlot,
        telemetry: {
          duration,
        },
      };

      self.postMessage(response);
    } catch (error) {
      clearTimeout(timeoutId);

      const response: TrajectoryWorkerResponse = {
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
        telemetry: {
          duration: performance.now() - startTime,
        },
      };

      self.postMessage(response);
    }
};

// Export empty object for TypeScript
export {};
