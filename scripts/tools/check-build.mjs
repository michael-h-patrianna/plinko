/**
 * Quick check if build output is valid
 */
import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist');
const indexHtml = path.join(distPath, 'index.html');
const indexJs = fs.readdirSync(path.join(distPath, 'assets'))
  .find(f => f.startsWith('index-') && f.endsWith('.js'));

console.log('📦 Build check:');
console.log('  index.html:', fs.existsSync(indexHtml) ? '✓' : '✗');
console.log('  index.js:', indexJs ? `✓ (${indexJs})` : '✗');

if (fs.existsSync(indexHtml)) {
  const html = fs.readFileSync(indexHtml, 'utf8');
  console.log('  References index.js:', html.includes(indexJs) ? '✓' : '✗');
}

if (indexJs) {
  const jsPath = path.join(distPath, 'assets', indexJs);
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  const size = (jsContent.length / 1024).toFixed(2);
  console.log(`  JS size: ${size} KB`);

  // Check for obvious errors
  if (jsContent.includes('undefined is not a function')) {
    console.log('  ❌ Contains runtime errors!');
  }

  // Check if React is included
  console.log('  Contains React:', jsContent.includes('react') || jsContent.includes('React') ? '✓' : '✗');
  console.log('  Contains Framer Motion:', jsContent.includes('motion') || jsContent.includes('framer') ? '✓' : '✗');
}
