import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Capture console logs
const logs = [];
page.on('console', msg => logs.push({type: msg.type(), text: msg.text()}));

// Capture errors
const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:5173/');
await page.waitForTimeout(3000);

// Get game state
const gameState = await page.evaluate(() => {
  const container = document.querySelector('[data-game-state]');
  return container?.getAttribute('data-game-state') || 'not found';
});

// Check for PlinkoBoard
const hasPlinkoBoard = await page.evaluate(() => {
  return document.querySelector('[data-testid="plinko-board"]') !== null;
});

// Check if board is in AnimatePresence condition
const checkCondition = await page.evaluate(() => {
  const container = document.querySelector('[data-game-state]');
  const state = container?.getAttribute('data-game-state');
  const validStates = ['selecting-position', 'countdown', 'dropping', 'landed', 'celebrating'];
  return {
    currentState: state,
    shouldRender: validStates.includes(state)
  };
});

console.log('=== GAME STATE ===');
console.log('Current state:', gameState);
console.log('PlinkoBoard exists:', hasPlinkoBoard);
console.log('Condition check:', JSON.stringify(checkCondition, null, 2));

console.log('\n=== CONSOLE LOGS (last 20) ===');
logs.slice(-20).forEach(log => console.log(`[${log.type}]`, log.text));

console.log('\n=== ERRORS ===');
errors.forEach(err => console.log('ERROR:', err));

await browser.close();
