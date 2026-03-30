import { execSync } from 'child_process';
import { existsSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = './dist';
const OUTPUT_FILE = join(DIST_DIR, '..', 'ip-show.zip');

// Check if dist exists
if (!existsSync(DIST_DIR)) {
  console.error('Error: dist directory not found. Run "pnpm build" first.');
  process.exit(1);
}

// Remove existing zip if present
if (existsSync(OUTPUT_FILE)) {
  unlinkSync(OUTPUT_FILE);
  console.log('Removed existing zip file');
}

// Create zip using system zip command
console.log('Creating zip archive...');
try {
  execSync(`cd ${DIST_DIR} && zip -r ../ip-show.zip . -x "*.DS_Store" -x "*.map"`, { encoding: 'utf-8' });
} catch (e) {
  // zip might not show output on success
}

// Get zip size
const zipStats = statSync(OUTPUT_FILE);
console.log(`Created ip-show.zip (${(zipStats.size / 1024).toFixed(1)} KB)`);
console.log(`Path: ${OUTPUT_FILE}`);
