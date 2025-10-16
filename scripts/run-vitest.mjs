#!/usr/bin/env node
import { spawn } from 'node:child_process';

const env = {
  ...process.env,
};

const args = process.argv.slice(2);
const child = spawn('npx', ['vitest', ...args], {
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
