/**
 * Hook to generate trajectories using Web Worker
 * Falls back to main thread if Worker is unavailable
 */

import { useRef, useCallback } from 'react';
import type { TrajectoryPoint } from '../game/types';
import type {
  TrajectoryWorkerRequest,
  TrajectoryWorkerResponse,
} from '../workers/trajectory.worker';
import { generateTrajectory } from '../game/trajectory';

interface GenerateTrajectoryParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  seed?: number;
}

export function useTrajectoryWorker() {
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker on first use
  const getWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }

    // Check if Worker is supported
    if (typeof Worker === 'undefined') {
      return null;
    }

    try {
      // Create worker using new URL pattern
      workerRef.current = new Worker(
        new URL('../workers/trajectory.worker.ts', import.meta.url),
        { type: 'module' }
      );
      return workerRef.current;
    } catch (error) {
      console.warn('Failed to create trajectory worker, will use main thread:', error);
      return null;
    }
  }, []);

  const generateTrajectoryAsync = useCallback(
    (params: GenerateTrajectoryParams): Promise<{ trajectory: TrajectoryPoint[]; landedSlot: number }> => {
      const worker = getWorker();

      // Fallback to main thread if worker not available
      if (!worker) {
        console.log('Generating trajectory on main thread (worker not available)');
        return Promise.resolve(generateTrajectory(params));
      }

      return new Promise((resolve, reject) => {
        let hasResponded = false;

        // Safety timeout: if worker doesn't respond in 12s, fall back to main thread
        const safetyTimeout = setTimeout(() => {
          if (!hasResponded) {
            console.warn('Worker timeout - falling back to main thread');
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleError);
            hasResponded = true;
            // Fall back to synchronous generation
            try {
              const result = generateTrajectory(params);
              resolve(result);
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          }
        }, 12000);

        const handleMessage = (event: MessageEvent<TrajectoryWorkerResponse>) => {
          if (hasResponded) return;

          const { type, trajectory, landedSlot, error, telemetry } = event.data;

          // Log telemetry
          if (telemetry) {
            console.log(`Trajectory generation: ${telemetry.duration.toFixed(0)}ms`);
          }

          if (type === 'success' && trajectory && landedSlot !== undefined) {
            clearTimeout(safetyTimeout);
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleError);
            hasResponded = true;
            resolve({ trajectory, landedSlot });
          } else if (type === 'error' || type === 'timeout') {
            clearTimeout(safetyTimeout);
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleError);
            hasResponded = true;
            reject(new Error(error || 'Unknown worker error'));
          }
        };

        const handleError = (error: ErrorEvent) => {
          if (hasResponded) return;

          clearTimeout(safetyTimeout);
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          hasResponded = true;
          reject(new Error(`Worker error: ${error.message}`));
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);

        // Send request to worker
        const request: TrajectoryWorkerRequest = {
          type: 'generate',
          payload: {
            ...params,
            timeout: 10000, // 10s timeout
          },
        };

        worker.postMessage(request);
      });
    },
    [getWorker]
  );

  // Cleanup worker on unmount
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    generateTrajectoryAsync,
    cleanup,
  };
}
