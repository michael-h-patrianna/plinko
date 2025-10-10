import { generateTrajectory } from '@game/trajectory';
import type { DropZone, TrajectoryPoint } from '@game/types';
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

const centerDropZoneFixture = buildTrajectoryFixture('centerDropZone', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  dropZone: 'center',
  seed: getDeterministicSeed('default'),
});

const rightDropZoneFixture = buildTrajectoryFixture('rightDropZone', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  dropZone: 'right',
  seed: getDeterministicSeed('slot5'),
});

// Per-slot fixtures for targeted testing
const slot0Fixture = buildTrajectoryFixture('landInSlot0', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot0'),
});

const slot1Fixture = buildTrajectoryFixture('landInSlot1', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot1'),
});

const slot2Fixture = buildTrajectoryFixture('landInSlot2', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot2'),
});

const slot3Fixture = buildTrajectoryFixture('landInSlot3', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot3'),
});

const slot4Fixture = buildTrajectoryFixture('landInSlot4', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot4'),
});

const slot5Fixture = buildTrajectoryFixture('landInSlot5', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slot5'),
});

// Edge case fixtures
const manyCollisionsFixture = buildTrajectoryFixture('manyCollisions', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('manyCollisions'),
});

const fewCollisionsFixture = buildTrajectoryFixture('fewCollisions', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('fewCollisions'),
});

const fastDropFixture = buildTrajectoryFixture('fastDrop', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('fastDrop'),
});

const slowBouncyFixture = buildTrajectoryFixture('slowBouncy', {
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 6,
  seed: getDeterministicSeed('slowBouncy'),
});

export const trajectoryFixtures: Record<string, TrajectoryFixture> = {
  defaultSixSlot: defaultFixture,
  leftDropZone: leftDropZoneFixture,
  centerDropZone: centerDropZoneFixture,
  rightDropZone: rightDropZoneFixture,
  landInSlot0: slot0Fixture,
  landInSlot1: slot1Fixture,
  landInSlot2: slot2Fixture,
  landInSlot3: slot3Fixture,
  landInSlot4: slot4Fixture,
  landInSlot5: slot5Fixture,
  manyCollisions: manyCollisionsFixture,
  fewCollisions: fewCollisionsFixture,
  fastDrop: fastDropFixture,
  slowBouncy: slowBouncyFixture,
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
