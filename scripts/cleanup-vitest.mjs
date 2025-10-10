#!/usr/bin/env node
/**
 * Kills any lingering Vitest processes before starting a new test run.
 * This prevents piles of background processes from exhausting system memory.
 *
 * Targets:
 * - Watch mode processes: vitest --watch
 * - Orphaned worker processes: node ... vitest/dist/...
 * - Hanging test runners
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

(async function main() {
  const processes = listProcesses();

  // Match multiple patterns to catch all Vitest-related processes
  const vitestMatches = processes.filter(({ command }) => {
    // Exclude shell wrappers and other non-vitest processes
    if (command.includes('/bin/zsh') || command.includes('/bin/bash')) return false;
    if (command.includes('claude/shell-snapshots')) return false;
    if (command.includes('scripts/cleanup-vitest.mjs')) return false;
    if (command.includes('grep')) return false;

    // Watch mode processes (original pattern)
    if (/vitest(?!\s+run)/.test(command)) return true;

    // Vitest worker threads/forks (node processes running vitest internals)
    if (/node.*vitest.*worker/i.test(command)) return true;

    // Orphaned vitest processes
    if (/vitest.*--pool/i.test(command)) return true;

    // Specific worker process patterns
    if (/vitest\/dist\/workers/.test(command)) return true;

    return false;
  });

  if (vitestMatches.length === 0) {
    console.log('[cleanup-vitest] No lingering Vitest processes found. ✓');
    process.exit(0);
  }

  console.log(`[cleanup-vitest] Found ${vitestMatches.length} lingering Vitest processes...`);

  // First pass: SIGTERM (graceful)
  for (const { pid, command } of vitestMatches) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`  • Sent SIGTERM to PID ${pid}`);
      console.log(`    ${command.slice(0, 80)}${command.length > 80 ? '...' : ''}`);
    } catch (error) {
      // Process may have already exited
      if (error.code !== 'ESRCH') {
        console.warn(`  • Failed to terminate PID ${pid}: ${error.message}`);
      }
    }
  }

  // Give processes time to exit gracefully
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Second pass: SIGKILL (force kill) for any survivors
  const remainingProcesses = listProcesses();
  const stillRunning = vitestMatches.filter(({ pid }) =>
    remainingProcesses.some((p) => p.pid === pid)
  );

  if (stillRunning.length > 0) {
    console.log(`[cleanup-vitest] Force-killing ${stillRunning.length} unresponsive processes...`);
    for (const { pid } of stillRunning) {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`  • Sent SIGKILL to PID ${pid}`);
      } catch (error) {
        if (error.code !== 'ESRCH') {
          console.warn(`  • Failed to kill PID ${pid}: ${error.message}`);
        }
      }
    }
  }

  // Final wait for OS to reap child processes
  await new Promise((resolve) => setTimeout(resolve, 200));

  console.log('[cleanup-vitest] Cleanup complete. ✓');
  process.exit(0);
})();
