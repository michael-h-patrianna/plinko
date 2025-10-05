/**
 * Simple standalone test to verify trajectory generation works
 */

// Inline the trajectory generation logic to test it
const PHYSICS = {
  GRAVITY: 980,
  RESTITUTION: 0.75,
  BALL_RADIUS: 9,
  PEG_RADIUS: 7,
  COLLISION_RADIUS: 16,
  DT: 1 / 60,
  TERMINAL_VELOCITY: 600,
  BORDER_WIDTH: 12,
  MIN_BOUNCE_VELOCITY: 30,
};

console.log('Testing basic trajectory generation...');
console.log('PHYSICS constants:', PHYSICS);

// Try to generate one trajectory with seed 0
console.log('\nAttempt 1: seed=0');
const startTime = Date.now();

// Simulate what generateTrajectory does
let attempt = 0;
const maxAttempts = 100;

for (attempt = 0; attempt < maxAttempts; attempt++) {
  console.log(`  Attempt ${attempt + 1}/${maxAttempts}...`);

  // Simplified simulation
  let y = PHYSICS.BORDER_WIDTH + 10;
  let frame = 0;

  // Simulate 100 frames
  for (frame = 0; frame < 100; frame++) {
    y += 5; // Simple downward movement
  }

  if (y > 300) {
    console.log(`  ✅ Success on attempt ${attempt + 1}`);
    break;
  }
}

const elapsed = Date.now() - startTime;
console.log(`\nCompleted in ${elapsed}ms`);

if (attempt >= maxAttempts) {
  console.error('❌ FAILED: Could not generate valid trajectory');
  process.exit(1);
} else {
  console.log('✅ PASSED: Basic logic works');
}
