#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const srcDir = join(projectRoot, 'src');
const outputFile = join(projectRoot, 'docs', 'largefiles.md');

/**
 * Recursively find all files in a directory
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of file paths
 */
async function getAllFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Count lines in a file
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} - Number of lines
 */
async function countLines(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Scanning src/ directory for large files...');

  // Get all files in src/
  const allFiles = await getAllFiles(srcDir);

  // Count lines for each file
  const fileStats = [];
  for (const file of allFiles) {
    const lines = await countLines(file);
    if (lines > 400) {
      const relativePath = relative(projectRoot, file);
      fileStats.push({ path: relativePath, lines });
    }
  }

  // Sort by line count (descending)
  fileStats.sort((a, b) => b.lines - a.lines);

  // Generate markdown report
  const now = new Date().toISOString().split('T')[0];
  let markdown = `# Large Files Report\n\n`;
  markdown += `Generated: ${now}\n\n`;
  markdown += `Files in \`src/\` with more than 400 lines of code.\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `Total files over 400 lines: **${fileStats.length}**\n\n`;

  if (fileStats.length > 0) {
    markdown += `## Files\n\n`;
    markdown += `| File | Lines |\n`;
    markdown += `|------|-------|\n`;

    for (const { path, lines } of fileStats) {
      markdown += `| \`${path}\` | ${lines} |\n`;
    }
  } else {
    markdown += `No files found with more than 400 lines.\n`;
  }

  // Write to output file
  await writeFile(outputFile, markdown, 'utf-8');
  console.log(`\nReport written to: docs/largefiles.md`);
  console.log(`Found ${fileStats.length} files over 400 lines`);

  if (fileStats.length > 0) {
    console.log('\nTop 5 largest files:');
    fileStats.slice(0, 5).forEach(({ path, lines }) => {
      console.log(`  ${lines} lines - ${path}`);
    });
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
