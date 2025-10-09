/**
 * Test Fixture Builders
 *
 * Builder pattern to reduce duplication in test fixture creation
 */

import { generateTrajectory } from '../../game/trajectory';
import type { DropZone, PrizeConfig, TrajectoryPoint } from '../../game/types';
import { getDeterministicSeed, type DeterministicSeedName } from './seedFixtures';

// ============================================================================
// BOARD CONFIGURATION BUILDER
// ============================================================================

export interface BoardConfig {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
}

export class BoardConfigBuilder {
  private config: BoardConfig = {
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
  };

  width(boardWidth: number): this {
    this.config.boardWidth = boardWidth;
    return this;
  }

  height(boardHeight: number): this {
    this.config.boardHeight = boardHeight;
    return this;
  }

  rows(pegRows: number): this {
    this.config.pegRows = pegRows;
    return this;
  }

  slots(slotCount: number): this {
    this.config.slotCount = slotCount;
    return this;
  }

  build(): BoardConfig {
    return { ...this.config };
  }

  /**
   * Create default 6-slot board
   */
  static default(): BoardConfig {
    return new BoardConfigBuilder().build();
  }

  /**
   * Create mobile-sized board
   */
  static mobile(): BoardConfig {
    return new BoardConfigBuilder().width(360).height(640).build();
  }

  /**
   * Create desktop-sized board
   */
  static desktop(): BoardConfig {
    return new BoardConfigBuilder().width(500).height(700).build();
  }
}

// ============================================================================
// TRAJECTORY FIXTURE BUILDER
// ============================================================================

export interface TrajectoryFixture {
  name: string;
  params: BoardConfig & { seed: number; dropZone?: DropZone };
  landedSlot: number;
  trajectory: TrajectoryPoint[];
}

export class TrajectoryFixtureBuilder {
  private name = 'unnamed';
  private boardConfig: BoardConfig = BoardConfigBuilder.default();
  private seed = getDeterministicSeed();
  private dropZone?: DropZone;

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withBoard(config: BoardConfig): this {
    this.boardConfig = config;
    return this;
  }

  withSeed(seed: number | DeterministicSeedName): this {
    this.seed = typeof seed === 'number' ? seed : getDeterministicSeed(seed);
    return this;
  }

  withDropZone(dropZone: DropZone): this {
    this.dropZone = dropZone;
    return this;
  }

  withSlots(slotCount: number): this {
    this.boardConfig.slotCount = slotCount;
    return this;
  }

  withRows(pegRows: number): this {
    this.boardConfig.pegRows = pegRows;
    return this;
  }

  build(): TrajectoryFixture {
    const params = {
      ...this.boardConfig,
      seed: this.seed,
      dropZone: this.dropZone,
    };

    const result = generateTrajectory(params);

    return {
      name: this.name,
      params,
      landedSlot: result.landedSlot,
      trajectory: result.trajectory,
    };
  }

  /**
   * Build and return a copy (prevents mutation)
   */
  buildCopy(): TrajectoryFixture {
    const fixture = this.build();
    return {
      ...fixture,
      params: { ...fixture.params },
      trajectory: fixture.trajectory.map((p) => ({ ...p })),
    };
  }

  /**
   * Create default fixture
   */
  static default(): TrajectoryFixture {
    return new TrajectoryFixtureBuilder()
      .withName('default')
      .build();
  }

  /**
   * Create fixture for specific slot
   */
  static forSlot(slotIndex: number): TrajectoryFixture {
    return new TrajectoryFixtureBuilder()
      .withName(`landInSlot${slotIndex}`)
      .withSeed(`slot${slotIndex}` as DeterministicSeedName)
      .build();
  }

  /**
   * Create fixture for specific drop zone
   */
  static forDropZone(zone: DropZone): TrajectoryFixture {
    return new TrajectoryFixtureBuilder()
      .withName(`${zone}DropZone`)
      .withDropZone(zone)
      .withSeed('default') // Use default seed for drop zones
      .build();
  }
}

// ============================================================================
// PRIZE FIXTURE BUILDER
// ============================================================================

export class PrizeFixtureBuilder {
  private prize: Partial<PrizeConfig> = {
    id: 'test-prize',
    type: 'free',
    probability: 0.5,
    slotIcon: '/test-icon.png',
    slotColor: '#4CAF50',
    title: 'Test Prize',
    description: 'Test prize description',
    freeReward: {
      gc: 100,
    },
  };

  withId(id: string): this {
    this.prize.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.prize.title = title;
    return this;
  }

  withType(type: PrizeConfig['type']): this {
    this.prize.type = type;
    return this;
  }

  withProbability(probability: number): this {
    this.prize.probability = probability;
    return this;
  }

  withSlotIcon(slotIcon: string): this {
    this.prize.slotIcon = slotIcon;
    return this;
  }

  withSlotColor(slotColor: string): this {
    this.prize.slotColor = slotColor;
    return this;
  }

  withFreeReward(freeReward: PrizeConfig['freeReward']): this {
    this.prize.freeReward = freeReward;
    return this;
  }

  withPurchaseOffer(purchaseOffer: PrizeConfig['purchaseOffer']): this {
    this.prize.purchaseOffer = purchaseOffer;
    return this;
  }

  build(): PrizeConfig {
    return this.prize as PrizeConfig;
  }

  /**
   * Create default item prize
   */
  static item(): PrizeConfig {
    return new PrizeFixtureBuilder().build();
  }

  /**
   * Create currency prize
   */
  static currency(amount: number): PrizeConfig {
    return new PrizeFixtureBuilder()
      .withType('free')
      .withFreeReward({ gc: amount })
      .withTitle(`${amount} Coins`)
      .build();
  }

  /**
   * Create no-win prize
   */
  static noWin(): PrizeConfig {
    return new PrizeFixtureBuilder()
      .withType('no_win')
      .withTitle('Try Again')
      .withProbability(0.1)
      .withFreeReward(undefined)
      .build();
  }

  /**
   * Create rare prize
   */
  static rare(): PrizeConfig {
    return new PrizeFixtureBuilder()
      .withTitle('Rare Item')
      .withProbability(0.05)
      .withFreeReward({ sc: 500 })
      .build();
  }
}

// ============================================================================
// GAME STATE FIXTURE BUILDER
// ============================================================================

export interface GameStateFixture {
  state: string;
  context: {
    selectedIndex: number;
    trajectory: TrajectoryPoint[];
    currentFrame: number;
    prize: PrizeConfig | null;
    seed: number;
    dropZone?: DropZone;
  };
}

export class GameStateFixtureBuilder {
  private state = 'idle';
  private context = {
    selectedIndex: -1,
    trajectory: [] as TrajectoryPoint[],
    currentFrame: 0,
    prize: null as PrizeConfig | null,
    seed: 0,
    dropZone: undefined as DropZone | undefined,
  };

  withState(state: string): this {
    this.state = state;
    return this;
  }

  withTrajectory(trajectory: TrajectoryPoint[]): this {
    this.context.trajectory = trajectory;
    return this;
  }

  withPrize(prize: PrizeConfig): this {
    this.context.prize = prize;
    return this;
  }

  withSlot(slotIndex: number): this {
    this.context.selectedIndex = slotIndex;
    return this;
  }

  withFrame(frame: number): this {
    this.context.currentFrame = frame;
    return this;
  }

  withSeed(seed: number): this {
    this.context.seed = seed;
    return this;
  }

  withDropZone(dropZone: DropZone): this {
    this.context.dropZone = dropZone;
    return this;
  }

  build(): GameStateFixture {
    return {
      state: this.state,
      context: { ...this.context },
    };
  }

  /**
   * Create idle state
   */
  static idle(): GameStateFixture {
    return new GameStateFixtureBuilder().build();
  }

  /**
   * Create ready state with trajectory
   */
  static ready(trajectoryFixture?: TrajectoryFixture): GameStateFixture {
    const fixture = trajectoryFixture ?? TrajectoryFixtureBuilder.default();

    return new GameStateFixtureBuilder()
      .withState('ready')
      .withTrajectory(fixture.trajectory)
      .withSlot(fixture.landedSlot)
      .withSeed(fixture.params.seed)
      .build();
  }

  /**
   * Create landed state
   */
  static landed(
    trajectoryFixture?: TrajectoryFixture,
    prize?: PrizeConfig
  ): GameStateFixture {
    const fixture = trajectoryFixture ?? TrajectoryFixtureBuilder.default();

    return new GameStateFixtureBuilder()
      .withState('landed')
      .withTrajectory(fixture.trajectory)
      .withSlot(fixture.landedSlot)
      .withSeed(fixture.params.seed)
      .withPrize(prize ?? PrizeFixtureBuilder.item())
      .build();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create multiple trajectory fixtures at once
 */
export function createTrajectoryFixtures(count: number): TrajectoryFixture[] {
  return Array.from({ length: count }, (_, i) =>
    new TrajectoryFixtureBuilder()
      .withName(`fixture${i}`)
      .withSeed(i)
      .build()
  );
}

/**
 * Create trajectory fixtures for all slots
 */
export function createSlotFixtures(slotCount: number): TrajectoryFixture[] {
  return Array.from({ length: slotCount }, (_, i) =>
    TrajectoryFixtureBuilder.forSlot(i)
  );
}

/**
 * Create trajectory fixtures for all drop zones
 */
export function createDropZoneFixtures(): Record<DropZone, TrajectoryFixture> {
  const zones: DropZone[] = ['left', 'left-center', 'center', 'right-center', 'right'];
  return zones.reduce((acc, zone) => {
    acc[zone] = TrajectoryFixtureBuilder.forDropZone(zone);
    return acc;
  }, {} as Record<DropZone, TrajectoryFixture>);
}
