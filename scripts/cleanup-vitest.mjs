#!/usr/bin/env node
/**
 * Kills any lingering Vitest watcher processes before starting a new test run.
 * This prevents piles of background `vitest --watch` instances from clogging the machine.
 */
import { execSync } from 'node:child_process';

function listProcesses() {
  try {
    const output = execSync('ps -A -o pid=,command=', { encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const spaceIndex = line.indexOf(' ');
        const pid = line.slice(0, spaceIndex).trim();
        const command = line.slice(spaceIndex + 1).trim();
        return { pid: Number(pid), command };
      });
  } catch (error) {
    console.warn('[cleanup-vitest] Unable to read process list:', error.message);
    return [];
  }
}

const processes = listProcesses();
const vitestMatches = processes.filter(({ command }) => /vitest(?!\s+run)/.test(command));

if (vitestMatches.length === 0) {
  process.exit(0);
}

console.log(`[cleanup-vitest] Terminating ${vitestMatches.length} lingering Vitest processes...`);

for (const { pid, command } of vitestMatches) {
  try {
    process.kill(pid, 'SIGTERM');
    console.log(`  • Killed PID ${pid} (${command})`);
  } catch (error) {
    console.warn(`  • Failed to kill PID ${pid}: ${error.message}`);
  }
}

// Give the OS a moment to reap child processes.
setTimeout(() => process.exit(0), 200);
