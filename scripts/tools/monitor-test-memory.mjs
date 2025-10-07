#!/usr/bin/env node
/**
 * Memory monitoring utility for test runs
 * Tracks Vitest worker processes and reports memory usage
 *
 * Usage:
 *   node scripts/tools/monitor-test-memory.mjs
 *
 * Run in a separate terminal while tests are running to monitor memory usage
 */
import { execSync } from 'node:child_process';

const INTERVAL_MS = 1000; // Update every second
const MAX_DURATION_MS = 600000; // Stop after 10 minutes

function getVitestProcesses() {
  try {
    const output = execSync('ps aux', { encoding: 'utf8' });
    const lines = output.split('\n').filter((line) => {
      return (
        line.includes('vitest') ||
        line.includes('node') && line.includes('worker')
      );
    });

    const processes = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        pid: parts[1],
        cpu: parseFloat(parts[2]),
        mem: parseFloat(parts[3]),
        rss: parseInt(parts[5], 10), // RSS in KB
        command: parts.slice(10).join(' '),
      };
    });

    return processes;
  } catch (error) {
    console.error('Error reading processes:', error.message);
    return [];
  }
}

function formatMemory(kb) {
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${(kb / 1024 / 1024).toFixed(2)} GB`;
}

function clearScreen() {
  process.stdout.write('\x1Bc');
}

async function monitor() {
  const startTime = Date.now();
  let maxMemory = 0;
  let maxWorkerCount = 0;
  let totalSamples = 0;

  console.log('🔍 Vitest Memory Monitor');
  console.log('━'.repeat(80));
  console.log('Press Ctrl+C to stop\n');

  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed > MAX_DURATION_MS) {
      clearInterval(interval);
      printSummary();
      process.exit(0);
    }

    clearScreen();

    console.log('🔍 Vitest Memory Monitor');
    console.log('━'.repeat(80));
    console.log(`Elapsed: ${(elapsed / 1000).toFixed(0)}s | Samples: ${totalSamples}\n`);

    const processes = getVitestProcesses();

    if (processes.length === 0) {
      console.log('⏳ No Vitest processes detected. Waiting...\n');
      console.log('Start your tests in another terminal with: npm test');
      return;
    }

    totalSamples++;

    // Calculate totals
    const totalMemoryKB = processes.reduce((sum, p) => sum + p.rss, 0);
    const totalCPU = processes.reduce((sum, p) => sum + p.cpu, 0);
    const workerCount = processes.length;

    maxMemory = Math.max(maxMemory, totalMemoryKB);
    maxWorkerCount = Math.max(maxWorkerCount, workerCount);

    // Display summary
    console.log('📊 CURRENT STATE:');
    console.log(`  Workers:       ${workerCount}`);
    console.log(`  Total Memory:  ${formatMemory(totalMemoryKB)}`);
    console.log(`  Total CPU:     ${totalCPU.toFixed(1)}%`);
    console.log(`  Avg per Worker: ${formatMemory(totalMemoryKB / workerCount)}\n`);

    console.log('📈 PEAK VALUES:');
    console.log(`  Max Workers:   ${maxWorkerCount}`);
    console.log(`  Max Memory:    ${formatMemory(maxMemory)}\n`);

    // Display individual processes
    console.log('🔧 WORKER PROCESSES:');
    console.log('─'.repeat(80));
    console.log(
      'PID'.padEnd(8) +
        'CPU%'.padEnd(8) +
        'Memory'.padEnd(12) +
        'Command'.padEnd(50)
    );
    console.log('─'.repeat(80));

    processes.forEach((proc) => {
      const command = proc.command.length > 48 ? proc.command.slice(0, 45) + '...' : proc.command;
      console.log(
        proc.pid.padEnd(8) +
          `${proc.cpu.toFixed(1)}%`.padEnd(8) +
          formatMemory(proc.rss).padEnd(12) +
          command
      );
    });

    console.log('─'.repeat(80));
    console.log('\n💡 Press Ctrl+C to stop monitoring and view summary');
  }, INTERVAL_MS);

  function printSummary() {
    console.log('\n\n');
    console.log('━'.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('━'.repeat(80));
    console.log(`Max Workers: ${maxWorkerCount}`);
    console.log(`Max Memory:  ${formatMemory(maxMemory)}`);
    console.log(`Samples:     ${totalSamples}`);
    console.log(`Duration:    ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log('━'.repeat(80));

    // Memory warnings
    if (maxMemory > 4 * 1024 * 1024) {
      console.log('\n⚠️  WARNING: Peak memory exceeded 4GB!');
      console.log('   Consider reducing maxWorkers in vitest.config.ts');
    } else if (maxMemory > 2 * 1024 * 1024) {
      console.log('\n⚠️  Peak memory exceeded 2GB (high but manageable)');
    } else {
      console.log('\n✅ Memory usage looks healthy');
    }

    if (maxWorkerCount > 4) {
      console.log(`\n⚠️  Peak worker count was ${maxWorkerCount} (configured max is 4)`);
      console.log('   Check if Vitest configuration is being respected');
    }

    console.log('\n');
  }

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    clearInterval(interval);
    printSummary();
    process.exit(0);
  });
}

monitor();
