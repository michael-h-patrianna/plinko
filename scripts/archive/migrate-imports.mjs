#!/usr/bin/env node
/**
 * Migrate deep relative imports to TypeScript path aliases
 *
 * Converts:
 *   import { foo } from '../../../../game/something'
 * To:
 *   import { foo } from '@game/something'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../../src');

// Path alias mappings (order matters - more specific first)
const ALIAS_MAPPINGS = [
  { pattern: /from ['"](\.\.[\/\\])+game\/(.+)['"]/g, replacement: "from '@game/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+components\/(.+)['"]/g, replacement: "from '@components/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+utils\/(.+)['"]/g, replacement: "from '@utils/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+hooks\/(.+)['"]/g, replacement: "from '@hooks/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+theme\/(.+)['"]/g, replacement: "from '@theme/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+config\/(.+)['"]/g, replacement: "from '@config/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+tests\/(.+)['"]/g, replacement: "from '@tests/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+animation\/(.+)['"]/g, replacement: "from '@/animation/$2'" },
  { pattern: /from ['"](\.\.[\/\\])+dev-tools\/(.+)['"]/g, replacement: "from '@/dev-tools/$2'" },
];

let filesProcessed = 0;
let importsUpdated = 0;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileChanged = false;

  for (const { pattern, replacement } of ALIAS_MAPPINGS) {
    const matches = content.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      if (newContent !== content) {
        fileChanged = true;
        importsUpdated += matches.length;
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    filesProcessed++;
    return true;
  }
  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (/\.(ts|tsx)$/.test(file)) {
      processFile(filePath);
    }
  }
}

console.log('🔄 Migrating imports to path aliases...');
console.log(`📂 Scanning: ${srcDir}\n`);

walkDirectory(srcDir);

console.log(`\n✅ Migration complete!`);
console.log(`   Files updated: ${filesProcessed}`);
console.log(`   Imports migrated: ${importsUpdated}`);
