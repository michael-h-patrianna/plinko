/**
 * Compare peg layouts between test and game to diagnose tunneling bug
 */

const BOARD_WIDTH = 375;
const BOARD_HEIGHT = 500;
const PEG_ROWS = 10;
const BALL_RADIUS = 9;
const PEG_RADIUS = 7;
const BORDER_WIDTH = 12;

// Test's peg generation (from physicsRealism.test.ts)
function generateTestPegLayout() {
  const pegs = [];
  const OPTIMAL_PEG_COLUMNS = 6;
  const pegPadding = PEG_RADIUS + 10;
  const playableWidth = BOARD_WIDTH - BORDER_WIDTH * 2 - pegPadding * 2;
  const playableHeight = BOARD_HEIGHT * 0.65;
  const verticalSpacing = playableHeight / (PEG_ROWS + 1);
  const horizontalSpacing = playableWidth / OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < PEG_ROWS; row++) {
    const y = verticalSpacing * (row + 1) + BORDER_WIDTH + 20;
    const isOffsetRow = row % 2 === 1;
    const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
    const numPegs = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

    for (let col = 0; col < numPegs; col++) {
      const x = BORDER_WIDTH + pegPadding + horizontalSpacing * col + offset;
      pegs.push({ x, y, row, col });
    }
  }

  return pegs;
}

// Game's peg generation (from boardGeometry.ts - simplified for node)
function generateGamePegLayout() {
  const pegs = [];
  const OPTIMAL_PEG_COLUMNS = 6;
  const CSS_BORDER = 2;
  const PLAYABLE_HEIGHT_RATIO = 0.65;
  const PEG_TOP_OFFSET = 20;

  const internalWidth = BOARD_WIDTH - CSS_BORDER * 2;

  // Determine responsive sizing
  const SMALL_VIEWPORT_WIDTH = 360;
  const isSmallViewport = internalWidth <= SMALL_VIEWPORT_WIDTH;
  const pegRadius = isSmallViewport ? 6 : 7;
  const ballRadius = isSmallViewport ? 6 : 7;
  const extraClearance = isSmallViewport ? 8 : 10;

  const minClearance = pegRadius + ballRadius + extraClearance;
  const playableHeight = BOARD_HEIGHT * PLAYABLE_HEIGHT_RATIO;
  const verticalSpacing = playableHeight / (PEG_ROWS + 1);

  const leftEdge = BORDER_WIDTH + minClearance;
  const rightEdge = internalWidth - BORDER_WIDTH - minClearance;
  const pegSpanWidth = rightEdge - leftEdge;
  const horizontalSpacing = pegSpanWidth / OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < PEG_ROWS; row++) {
    const y = verticalSpacing * (row + 1) + BORDER_WIDTH + PEG_TOP_OFFSET;
    const isOffsetRow = row % 2 === 1;
    const pegsInRow = isOffsetRow ? OPTIMAL_PEG_COLUMNS : OPTIMAL_PEG_COLUMNS + 1;

    for (let col = 0; col < pegsInRow; col++) {
      const x = isOffsetRow
        ? leftEdge + horizontalSpacing * (col + 0.5)
        : leftEdge + horizontalSpacing * col;

      pegs.push({ row, col, x, y });
    }
  }

  return pegs;
}

const testPegs = generateTestPegLayout();
const gamePegs = generateGamePegLayout();

console.log('=== PEG LAYOUT COMPARISON ===\n');
console.log(`Test pegs: ${testPegs.length}`);
console.log(`Game pegs: ${gamePegs.length}\n`);

console.log('First 10 test pegs:');
testPegs.slice(0, 10).forEach((p, i) => {
  console.log(`  ${i}: (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) row=${p.row} col=${p.col}`);
});

console.log('\nFirst 10 game pegs:');
gamePegs.slice(0, 10).forEach((p, i) => {
  console.log(`  ${i}: (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) row=${p.row} col=${p.col}`);
});

// Check if layouts match
let mismatches = 0;
for (let i = 0; i < Math.min(testPegs.length, gamePegs.length); i++) {
  const test = testPegs[i];
  const game = gamePegs[i];
  const dx = Math.abs(test.x - game.x);
  const dy = Math.abs(test.y - game.y);
  if (dx > 0.01 || dy > 0.01) {
    mismatches++;
    if (mismatches <= 5) {
      console.log(`\nMismatch at peg ${i}:`);
      console.log(`  Test: (${test.x.toFixed(2)}, ${test.y.toFixed(2)})`);
      console.log(`  Game: (${game.x.toFixed(2)}, ${game.y.toFixed(2)})`);
      console.log(`  Delta: (${dx.toFixed(2)}, ${dy.toFixed(2)})`);
    }
  }
}

console.log(`\n=== RESULT ===`);
if (mismatches === 0) {
  console.log('✅ Peg layouts MATCH - tunneling bug is NOT caused by peg position mismatch');
} else {
  console.log(`❌ Peg layouts DIFFER - ${mismatches} mismatches found`);
  console.log('   This explains why collisions aren\'t being detected!');
}
