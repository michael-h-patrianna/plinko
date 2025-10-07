/**
 * Comprehensive tests for boardGeometry module
 * Validates all geometry calculations, constants, and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  PHYSICS,
  BOARD,
  RESPONSIVE,
  DROP_ZONE_POSITIONS,
  DROP_ZONE_RANGES,
  generatePegLayout,
  calculateSlotDimensions,
  getDropZoneRange,
  getDropZoneCenter,
  clampSlotIndexFromX,
  getSlotBoundaries,
  validateSlotIndex,
  validateBoardDimensions,
  validatePegRows,
  distance,
  isInCircle,
  isInRect,
} from '../../../game/boardGeometry';

describe('boardGeometry - Constants', () => {
  describe('PHYSICS', () => {
    it('should have correct physics constants', () => {
      expect(PHYSICS.GRAVITY).toBe(980);
      expect(PHYSICS.RESTITUTION).toBe(0.75);
      expect(PHYSICS.BALL_RADIUS).toBe(9);
      expect(PHYSICS.PEG_RADIUS).toBe(7);
      expect(PHYSICS.COLLISION_RADIUS).toBe(16);
      expect(PHYSICS.DT).toBe(1 / 60);
      expect(PHYSICS.TERMINAL_VELOCITY).toBe(600);
      expect(PHYSICS.BORDER_WIDTH).toBe(12);
    });

    it('should have collision radius equal to ball + peg radius', () => {
      expect(PHYSICS.COLLISION_RADIUS).toBe(PHYSICS.BALL_RADIUS + PHYSICS.PEG_RADIUS);
    });
  });

  describe('BOARD', () => {
    it('should have correct board layout constants', () => {
      expect(BOARD.DEFAULT_WIDTH).toBe(375);
      expect(BOARD.DEFAULT_HEIGHT).toBe(500);
      expect(BOARD.CSS_BORDER).toBe(2);
      expect(BOARD.DEFAULT_PEG_ROWS).toBe(10);
      expect(BOARD.OPTIMAL_PEG_COLUMNS).toBe(6);
      expect(BOARD.PLAYABLE_HEIGHT_RATIO).toBe(0.65);
    });
  });

  describe('RESPONSIVE', () => {
    it('should have responsive sizing breakpoints', () => {
      expect(RESPONSIVE.SMALL_VIEWPORT_WIDTH).toBe(360);
      expect(RESPONSIVE.SMALL_PEG_RADIUS).toBe(6);
      expect(RESPONSIVE.NORMAL_PEG_RADIUS).toBe(7);
    });
  });

  describe('DROP_ZONE_POSITIONS', () => {
    it('should have all 5 drop zone positions defined', () => {
      expect(DROP_ZONE_POSITIONS.left).toBe(0.1);
      expect(DROP_ZONE_POSITIONS['left-center']).toBe(0.3);
      expect(DROP_ZONE_POSITIONS.center).toBe(0.5);
      expect(DROP_ZONE_POSITIONS['right-center']).toBe(0.7);
      expect(DROP_ZONE_POSITIONS.right).toBe(0.9);
    });
  });

  describe('DROP_ZONE_RANGES', () => {
    it('should have all 5 drop zone ranges defined', () => {
      const zones = ['left', 'left-center', 'center', 'right-center', 'right'] as const;
      zones.forEach((zone) => {
        expect(DROP_ZONE_RANGES[zone]).toBeDefined();
        expect(DROP_ZONE_RANGES[zone].min).toBeLessThan(DROP_ZONE_RANGES[zone].max);
      });
    });
  });
});

describe('boardGeometry - Peg Layout', () => {
  describe('generatePegLayout', () => {
    it('should generate correct number of pegs for default board', () => {
      const pegs = generatePegLayout({
        boardWidth: 375,
        boardHeight: 500,
        pegRows: 10,
      });

      // 10 rows: 5 non-offset (7 pegs each) + 5 offset (6 pegs each) = 35 + 30 = 65
      expect(pegs.length).toBe(65);
    });

    it('should generate staggered pattern (alternating row peg counts)', () => {
      const pegs = generatePegLayout({
        boardWidth: 375,
        boardHeight: 500,
        pegRows: 6,
      });

      // Count pegs per row
      const pegsByRow: Record<number, number> = {};
      pegs.forEach((peg) => {
        pegsByRow[peg.row] = (pegsByRow[peg.row] || 0) + 1;
      });

      // Row 0 (non-offset): 7 pegs
      // Row 1 (offset): 6 pegs
      // Row 2 (non-offset): 7 pegs
      // etc.
      expect(pegsByRow[0]).toBe(7);
      expect(pegsByRow[1]).toBe(6);
      expect(pegsByRow[2]).toBe(7);
      expect(pegsByRow[3]).toBe(6);
    });

    it('should position pegs within safe bounds (not touching walls)', () => {
      const boardWidth = 375;
      const pegs = generatePegLayout({
        boardWidth,
        boardHeight: 500,
        pegRows: 10,
      });

      const internalWidth = boardWidth - BOARD.CSS_BORDER * 2;
      const minX = PHYSICS.BORDER_WIDTH;
      const maxX = internalWidth - PHYSICS.BORDER_WIDTH;

      pegs.forEach((peg) => {
        expect(peg.x).toBeGreaterThan(minX);
        expect(peg.x).toBeLessThan(maxX);
      });
    });

    it('should assign correct row and column indices', () => {
      const pegs = generatePegLayout({
        boardWidth: 375,
        boardHeight: 500,
        pegRows: 4,
      });

      pegs.forEach((peg) => {
        expect(peg.row).toBeGreaterThanOrEqual(0);
        expect(peg.row).toBeLessThan(4);
        expect(peg.col).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(peg.row)).toBe(true);
        expect(Number.isInteger(peg.col)).toBe(true);
      });
    });

    it('should handle small viewport sizing', () => {
      const pegs = generatePegLayout({
        boardWidth: 320,
        boardHeight: 400,
        pegRows: 8,
      });

      // Should still generate pegs without error
      expect(pegs.length).toBeGreaterThan(0);
    });
  });
});

describe('boardGeometry - Slot Calculations', () => {
  describe('calculateSlotDimensions', () => {
    it('should calculate correct dimensions for 6 slots', () => {
      const dims = calculateSlotDimensions(375, 500, 6);

      expect(dims.slotCount).toBe(6);
      expect(dims.playableWidth).toBe(375 - BOARD.CSS_BORDER * 2 - PHYSICS.BORDER_WIDTH * 2);
      expect(dims.slotWidth).toBe(dims.playableWidth / 6);
      expect(dims.bucketHeight).toBeGreaterThan(0);
      expect(dims.bucketZoneY).toBeGreaterThan(0);
      expect(dims.bucketFloorY).toBeGreaterThan(dims.bucketZoneY);
    });

    it('should handle different slot counts', () => {
      const dims3 = calculateSlotDimensions(375, 500, 3);
      const dims8 = calculateSlotDimensions(375, 500, 8);

      expect(dims3.slotWidth).toBeGreaterThan(dims8.slotWidth);
    });

    it('should adjust bucket height based on slot width', () => {
      // More slots = narrower slots = taller buckets
      const dims3 = calculateSlotDimensions(375, 500, 3);
      const dims8 = calculateSlotDimensions(375, 500, 8);

      expect(dims8.bucketHeight).toBeGreaterThanOrEqual(dims3.bucketHeight);
    });
  });

  describe('clampSlotIndexFromX', () => {
    it('should return correct slot for center X position', () => {
      const boardWidth = 375;
      const slotCount = 6;
      const playableWidth = boardWidth - PHYSICS.BORDER_WIDTH * 2;
      const slotWidth = playableWidth / slotCount;

      // Position in slot 3 (center-ish)
      const x = PHYSICS.BORDER_WIDTH + slotWidth * 3 + slotWidth / 2;
      const slot = clampSlotIndexFromX(x, boardWidth, slotCount);

      expect(slot).toBe(3);
    });

    it('should clamp to first slot when X is at left edge', () => {
      const slot = clampSlotIndexFromX(PHYSICS.BORDER_WIDTH, 375, 6);
      expect(slot).toBe(0);
    });

    it('should clamp to last slot when X is at right edge', () => {
      const boardWidth = 375;
      const slotCount = 6;
      const x = boardWidth - PHYSICS.BORDER_WIDTH - 1;
      const slot = clampSlotIndexFromX(x, boardWidth, slotCount);

      expect(slot).toBe(slotCount - 1);
    });

    it('should never return negative index', () => {
      const slot = clampSlotIndexFromX(0, 375, 6);
      expect(slot).toBeGreaterThanOrEqual(0);
    });

    it('should never return index >= slotCount', () => {
      const slotCount = 6;
      const slot = clampSlotIndexFromX(1000, 375, slotCount);
      expect(slot).toBeLessThan(slotCount);
    });
  });

  describe('getSlotBoundaries', () => {
    it('should return correct boundaries for first slot', () => {
      const { leftEdge, rightEdge } = getSlotBoundaries(0, 375, 6);

      expect(leftEdge).toBeGreaterThan(PHYSICS.BORDER_WIDTH);
      expect(rightEdge).toBeGreaterThan(leftEdge);
    });

    it('should have boundaries within playable area', () => {
      const boardWidth = 375;
      const { leftEdge, rightEdge } = getSlotBoundaries(2, boardWidth, 6);

      expect(leftEdge).toBeGreaterThan(PHYSICS.BORDER_WIDTH);
      expect(rightEdge).toBeLessThan(boardWidth - PHYSICS.BORDER_WIDTH);
    });

    it('should account for wall thickness parameter', () => {
      const { leftEdge: left1 } = getSlotBoundaries(0, 375, 6, 3);
      const { leftEdge: left2 } = getSlotBoundaries(0, 375, 6, 5);

      expect(left2).toBeGreaterThan(left1);
    });
  });
});

describe('boardGeometry - Drop Zones', () => {
  describe('getDropZoneRange', () => {
    it('should return correct range for center zone', () => {
      const boardWidth = 375;
      const { min, max } = getDropZoneRange('center', boardWidth);

      expect(min).toBe(boardWidth * 0.45);
      expect(max).toBe(boardWidth * 0.55);
      expect(max).toBeGreaterThan(min);
    });

    it('should return ranges for all zones', () => {
      const zones: Array<'left' | 'left-center' | 'center' | 'right-center' | 'right'> = [
        'left',
        'left-center',
        'center',
        'right-center',
        'right',
      ];

      zones.forEach((zone) => {
        const { min, max } = getDropZoneRange(zone, 375);
        expect(min).toBeGreaterThanOrEqual(0);
        expect(max).toBeLessThanOrEqual(375);
        expect(max).toBeGreaterThan(min);
      });
    });
  });

  describe('getDropZoneCenter', () => {
    it('should return correct center for each zone', () => {
      expect(getDropZoneCenter('left', 375)).toBe(375 * 0.1);
      expect(getDropZoneCenter('center', 375)).toBe(375 * 0.5);
      expect(getDropZoneCenter('right', 375)).toBe(375 * 0.9);
    });

    it('should scale with board width', () => {
      const center1 = getDropZoneCenter('center', 300);
      const center2 = getDropZoneCenter('center', 400);

      expect(center2).toBeGreaterThan(center1);
      expect(center1).toBe(300 * 0.5);
      expect(center2).toBe(400 * 0.5);
    });
  });
});

describe('boardGeometry - Validation', () => {
  describe('validateSlotIndex', () => {
    it('should not throw for valid slot indices', () => {
      expect(() => validateSlotIndex(0, 6)).not.toThrow();
      expect(() => validateSlotIndex(5, 6)).not.toThrow();
      expect(() => validateSlotIndex(3, 10)).not.toThrow();
    });

    it('should throw for negative index', () => {
      expect(() => validateSlotIndex(-1, 6)).toThrow(/out of bounds/);
    });

    it('should throw for index >= slotCount', () => {
      expect(() => validateSlotIndex(6, 6)).toThrow(/out of bounds/);
      expect(() => validateSlotIndex(10, 6)).toThrow(/out of bounds/);
    });
  });

  describe('validateBoardDimensions', () => {
    it('should not throw for valid dimensions', () => {
      expect(() => validateBoardDimensions(375, 500)).not.toThrow();
      expect(() => validateBoardDimensions(300, 400)).not.toThrow();
    });

    it('should throw for zero or negative dimensions', () => {
      expect(() => validateBoardDimensions(0, 500)).toThrow(/Invalid board dimensions/);
      expect(() => validateBoardDimensions(375, -100)).toThrow(/Invalid board dimensions/);
    });

    it('should throw for dimensions too small', () => {
      expect(() => validateBoardDimensions(100, 500)).toThrow(/too small/);
      expect(() => validateBoardDimensions(375, 200)).toThrow(/too small/);
    });
  });

  describe('validatePegRows', () => {
    it('should not throw for valid peg row counts', () => {
      expect(() => validatePegRows(5)).not.toThrow();
      expect(() => validatePegRows(10)).not.toThrow();
      expect(() => validatePegRows(20)).not.toThrow();
    });

    it('should throw for zero or negative peg rows', () => {
      expect(() => validatePegRows(0)).toThrow(/must be greater than zero/);
      expect(() => validatePegRows(-5)).toThrow(/must be greater than zero/);
    });

    it('should throw for peg rows outside recommended range', () => {
      expect(() => validatePegRows(2)).toThrow(/out of recommended range/);
      expect(() => validatePegRows(25)).toThrow(/out of recommended range/);
    });
  });
});

describe('boardGeometry - Geometry Helpers', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5); // 3-4-5 triangle
      expect(distance(0, 0, 0, 0)).toBe(0);
      expect(distance(10, 10, 10, 10)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      expect(distance(-3, -4, 0, 0)).toBe(5);
      expect(distance(0, 0, -6, -8)).toBe(10);
    });
  });

  describe('isInCircle', () => {
    it('should return true for point inside circle', () => {
      expect(isInCircle(5, 5, 5, 5, 10)).toBe(true); // center
      expect(isInCircle(8, 5, 5, 5, 10)).toBe(true); // inside
    });

    it('should return false for point outside circle', () => {
      expect(isInCircle(20, 20, 5, 5, 10)).toBe(false);
    });

    it('should return true for point on circle edge', () => {
      expect(isInCircle(15, 5, 5, 5, 10)).toBe(true); // exactly on edge
    });
  });

  describe('isInRect', () => {
    it('should return true for point inside rectangle', () => {
      expect(isInRect(5, 5, 0, 0, 10, 10)).toBe(true);
      expect(isInRect(0, 0, 0, 0, 10, 10)).toBe(true); // top-left corner
    });

    it('should return false for point outside rectangle', () => {
      expect(isInRect(15, 5, 0, 0, 10, 10)).toBe(false);
      expect(isInRect(5, 15, 0, 0, 10, 10)).toBe(false);
    });

    it('should return true for point on rectangle edge', () => {
      expect(isInRect(10, 5, 0, 0, 10, 10)).toBe(true); // right edge
      expect(isInRect(5, 10, 0, 0, 10, 10)).toBe(true); // bottom edge
    });
  });
});

describe('boardGeometry - Integration Tests', () => {
  it('should generate pegs that fit within board bounds', () => {
    const boardWidth = 375;
    const boardHeight = 500;
    const pegs = generatePegLayout({ boardWidth, boardHeight, pegRows: 10 });

    const internalWidth = boardWidth - BOARD.CSS_BORDER * 2;

    pegs.forEach((peg) => {
      expect(peg.x).toBeGreaterThanOrEqual(PHYSICS.BORDER_WIDTH);
      expect(peg.x).toBeLessThanOrEqual(internalWidth - PHYSICS.BORDER_WIDTH);
      expect(peg.y).toBeGreaterThanOrEqual(PHYSICS.BORDER_WIDTH);
      expect(peg.y).toBeLessThanOrEqual(boardHeight);
    });
  });

  it('should have slot dimensions that fill playable area', () => {
    const boardWidth = 375;
    const slotCount = 6;
    const dims = calculateSlotDimensions(boardWidth, 500, slotCount);

    // Total slot width should equal playable width
    expect(dims.slotWidth * slotCount).toBeCloseTo(dims.playableWidth, 0.001);
  });

  it('should have drop zones covering board width', () => {
    const boardWidth = 375;
    const zones: Array<'left' | 'left-center' | 'center' | 'right-center' | 'right'> = [
      'left',
      'left-center',
      'center',
      'right-center',
      'right',
    ];

    // First zone should start near left
    const firstZone = zones[0];
    if (firstZone) {
      const { min: firstMin } = getDropZoneRange(firstZone, boardWidth);
      expect(firstMin).toBeLessThan(boardWidth * 0.2);
    }

    // Last zone should end near right
    const lastZone = zones[zones.length - 1];
    if (lastZone) {
      const { max: lastMax } = getDropZoneRange(lastZone, boardWidth);
      expect(lastMax).toBeGreaterThan(boardWidth * 0.8);
    }
  });
});
