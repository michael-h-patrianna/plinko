#!/usr/bin/env node
/**
 * Guarded wrapper around `vitest --watch`.
 * Requires ALLOW_VITEST_WATCH=1 to be set explicitly so automation cannot spawn endless watchers.
 */
import { spawn } from 'node:child_process';

if (process.env.ALLOW_VITEST_WATCH !== '1') {
  console.error('\nRefusing to start Vitest in watch mode.');
  console.error(
    'Set ALLOW_VITEST_WATCH=1 and run the command again if you really need an interactive watcher.'
  );
  console.error('Automation and coding agents must use `npm test` (vitest run) instead.\n');
  process.exit(1);
}

const env = {
  ...process.env,
  PLINKO_TEST_MODE: process.env.PLINKO_TEST_MODE ?? 'deterministic',
  PLINKO_FIXTURE_SEED: process.env.PLINKO_FIXTURE_SEED ?? '123456789',
};

const child = spawn('npx', ['vitest', '--watch'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1);
  } else {
    process.exit(code ?? 0);
  }
});
