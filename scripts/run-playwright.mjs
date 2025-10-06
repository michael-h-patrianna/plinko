#!/usr/bin/env node
import { spawn } from 'node:child_process';

const env = {
  ...process.env,
  PLINKO_TEST_MODE: process.env.PLINKO_TEST_MODE ?? 'deterministic',
  PLINKO_FIXTURE_SEED: process.env.PLINKO_FIXTURE_SEED ?? '123456789',
};

const args = process.argv.slice(2);
const child = spawn('npx', ['playwright', 'test', ...args], {
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
