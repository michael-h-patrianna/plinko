import { generateTrajectory } from '../../game/trajectory';
import type { DropZone, TrajectoryPoint } from '../../game/types';
import { getDeterministicSeed } from './seedFixtures';

export interface TrajectoryFixtureParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  seed: number;
  dropZone?: DropZone;
}

export interface TrajectoryFixture {
  name: string;
  params: TrajectoryFixtureParams;
  landedSlot: number;
  trajectory: TrajectoryPoint[];
}

function buildTrajectoryFixture(
  name: string,
  params: Omit<TrajectoryFixtureParams, 'seed'> & { seed?: number }
): TrajectoryFixture {
  const seed = params.seed ?? getDeterministicSeed();
  const trajectoryResult = generateTrajectory({ ...params, seed });

  return {
    name,
    params: { ...params, seed },
    landedSlot: trajectoryResult.landedSlot,
    trajectory: trajectoryResult.trajectory,
  };
}

const defaultFixture = buildTrajectoryFixture('defaultSixSlot', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
});

const leftDropZoneFixture = buildTrajectoryFixture('leftDropZone', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  dropZone: 'left',
  seed: getDeterministicSeed('alternate'),
});

export const trajectoryFixtures: Record<string, TrajectoryFixture> = {
  defaultSixSlot: defaultFixture,
  leftDropZone: leftDropZoneFixture,
};

export function getTrajectoryFixture(
  name: keyof typeof trajectoryFixtures = 'defaultSixSlot'
): TrajectoryFixture {
  const fixture = trajectoryFixtures[name];
  if (!fixture) {
    throw new Error(`Unknown trajectory fixture: ${name}`);
  }

  // Return copies so tests do not mutate shared state
  return {
    name: fixture.name,
    params: { ...fixture.params },
    landedSlot: fixture.landedSlot,
    trajectory: fixture.trajectory.map((point) => ({ ...point })),
  };
}
