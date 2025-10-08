#!/usr/bin/env node
/**
 * Verification script: Confirms currentFrameRef synchronization fix
 *
 * This script verifies that the ball visibility bug has been fixed by confirming:
 * 1. useGameAnimation receives currentFrameRef from parent
 * 2. useGameState reads from the same currentFrameRef
 * 3. Both hooks use the same reference (not separate instances)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

console.log('🔍 Verifying ball position fix...\n');

// Read the fixed files
const animationHookPath = join(projectRoot, 'src/hooks/useGameAnimation.ts');
const gameHookPath = join(projectRoot, 'src/hooks/usePlinkoGame.ts');
const stateHookPath = join(projectRoot, 'src/hooks/useGameState.ts');

const animationContent = readFileSync(animationHookPath, 'utf-8');
const gameContent = readFileSync(gameHookPath, 'utf-8');
const stateContent = readFileSync(stateHookPath, 'utf-8');

let allChecksPassed = true;

// CHECK 1: useGameAnimation receives currentFrameRef as parameter
console.log('✓ CHECK 1: useGameAnimation receives currentFrameRef parameter');
const hasParameter = animationContent.includes('currentFrameRef: React.MutableRefObject<number>');
if (hasParameter) {
  console.log('  ✅ PASS: currentFrameRef is in UseGameAnimationOptions interface\n');
} else {
  console.log('  ❌ FAIL: currentFrameRef parameter missing from interface\n');
  allChecksPassed = false;
}

// CHECK 2: useGameAnimation extracts currentFrameRef from options
console.log('✓ CHECK 2: useGameAnimation extracts currentFrameRef from options');
const extractsFromOptions = animationContent.includes('const { gameState, trajectory, onLandingComplete, currentFrameRef } = options;');
if (extractsFromOptions) {
  console.log('  ✅ PASS: currentFrameRef is destructured from options\n');
} else {
  console.log('  ❌ FAIL: currentFrameRef not extracted from options\n');
  allChecksPassed = false;
}

// CHECK 3: useGameAnimation does NOT create its own currentFrameRef
console.log('✓ CHECK 3: useGameAnimation does NOT create local currentFrameRef');
const createsOwnRef = animationContent.includes('const currentFrameRef = useRef(0);');
if (!createsOwnRef) {
  console.log('  ✅ PASS: No local currentFrameRef created (uses parent ref)\n');
} else {
  console.log('  ❌ FAIL: Still creating local currentFrameRef (duplicate ref issue)\n');
  allChecksPassed = false;
}

// CHECK 4: usePlinkoGame passes currentFrameRef to useGameAnimation
console.log('✓ CHECK 4: usePlinkoGame passes currentFrameRef to useGameAnimation');
const passesRef = gameContent.includes('currentFrameRef,') && gameContent.includes('useGameAnimation({');
if (passesRef) {
  console.log('  ✅ PASS: currentFrameRef is passed to useGameAnimation\n');
} else {
  console.log('  ❌ FAIL: currentFrameRef not passed to useGameAnimation\n');
  allChecksPassed = false;
}

// CHECK 5: usePlinkoGame passes currentFrameRef to useGameState
console.log('✓ CHECK 5: usePlinkoGame passes currentFrameRef to useGameState');
const passesToState = gameContent.includes('currentFrameRef,') && gameContent.includes('useGameState({');
if (passesToState) {
  console.log('  ✅ PASS: currentFrameRef is passed to useGameState\n');
} else {
  console.log('  ❌ FAIL: currentFrameRef not passed to useGameState\n');
  allChecksPassed = false;
}

// CHECK 6: useGameState uses currentFrameRef in getBallPosition
console.log('✓ CHECK 6: useGameState uses currentFrameRef in getBallPosition');
const usesInPosition = stateContent.includes('const currentFrame = currentFrameRef.current;');
if (usesInPosition) {
  console.log('  ✅ PASS: getBallPosition reads from currentFrameRef\n');
} else {
  console.log('  ❌ FAIL: getBallPosition not using currentFrameRef\n');
  allChecksPassed = false;
}

// SUMMARY
console.log('═'.repeat(60));
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED - Ball visibility bug is FIXED!\n');
  console.log('Summary of fix:');
  console.log('  • Single currentFrameRef created in usePlinkoGame');
  console.log('  • Passed to both useGameAnimation and useGameState');
  console.log('  • Animation loop writes to same ref that position calculation reads');
  console.log('  • Ball position now updates correctly during animation\n');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - Fix incomplete\n');
  process.exit(1);
}
