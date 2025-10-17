#!/usr/bin/env node
/**
 * Import path updater for plinko refactoring
 * Updates old path aliases to new @plinko/* and @demo/* structure
 *
 * This script performs precise replacements maintaining code correctness.
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

/**
 * Replace old path aliases with new ones
 * Order matters - more specific patterns first
 */
function updateImports(filePath, content) {
  let updated = content;
  const changes = [];

  // Track if file is in src/ root (old structure) vs src/plinko/ or src/demo/
  const isInSrcRoot = filePath.startsWith('src/') && !filePath.startsWith('src/plinko/') && !filePath.startsWith('src/demo/') && !filePath.startsWith('src/tests/');
  const isInDemo = filePath.startsWith('src/demo/');
  const isInPlinko = filePath.startsWith('src/plinko/');
  const isInTests = filePath.startsWith('src/tests/');

  // Define replacements (most specific first)
  const replacements = [
    // Special cases with full paths
    { from: "@/types/ref", to: "@plinko/types/ref" },
    { from: "@/audio/context/AudioProvider", to: "@plinko/audio/context/AudioProvider" },
    { from: "@/animation/ballAnimationDriver", to: "@plinko/animation/ballAnimationDriver" },
    { from: "@/animation/trailOptimization", to: "@plinko/animation/trailOptimization" },
    { from: "@/animation/useBallAnimationDriver", to: "@plinko/animation/useBallAnimationDriver" },

    // General patterns
    { from: "@game/", to: "@plinko/game/" },
    { from: "@utils/", to: "@plinko/utils/" },
    { from: "@hooks/", to: "@plinko/hooks/" },
    { from: "@theme/", to: "@plinko/theme/" },
    { from: "@components/", to: "@plinko/components/" },

    // Config moved to demo
    { from: "@config/", to: "@demo/config/" },

    // Tests
    { from: "@tests/", to: "@plinko/tests/" },
  ];

  for (const { from, to } of replacements) {
    const escapedFrom = from.replace(/\//g, '\\/');
    const regex = new RegExp(escapedFrom, 'g');

    const before = updated;
    updated = updated.replace(regex, to);

    if (before !== updated) {
      const count = (before.match(regex) || []).length;
      changes.push(`  ${from} → ${to} (${count} occurrence${count > 1 ? 's' : ''})`);
    }
  }

  return { updated, changes, hasChanges: updated !== content };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const directory = args.find(arg => !arg.startsWith('--')) || 'src';

  console.log(`🔍 Scanning ${directory} for files to update...`);
  if (dryRun) {
    console.log('   (DRY RUN - no files will be modified)\n');
  }

  // Find all TypeScript files
  const files = await glob(`${directory}/**/*.{ts,tsx}`, {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/scripts/**'],
  });

  console.log(`📁 Found ${files.length} TypeScript files\n`);

  let filesModified = 0;
  let totalChanges = 0;

  for (const file of files) {
    const fullPath = join(rootDir, file);
    const content = readFileSync(fullPath, 'utf-8');
    const { updated, changes, hasChanges } = updateImports(file, content);

    if (hasChanges) {
      filesModified++;
      totalChanges += changes.length;

      console.log(`📝 ${file}`);
      changes.forEach(change => console.log(change));
      console.log('');

      if (!dryRun) {
        writeFileSync(fullPath, updated, 'utf-8');
      }
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total changes: ${totalChanges}`);

  if (dryRun) {
    console.log('\n   Run without --dry-run to apply changes');
  } else {
    console.log('\n   Changes applied successfully!');
    console.log('   Run "npx tsc --noEmit" to verify imports');
  }
}

main().catch(console.error);
