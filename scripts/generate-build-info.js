/**
 * Generate build information file
 * Following Blockdoku PWA pattern
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildInfo = {
  version: process.env.npm_package_version || '0.1.0',
  buildTime: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  environment: process.env.NODE_ENV || 'development'
};

// Write to docs directory (after build)
const docsPath = join(__dirname, '../docs/build-info.json');
const srcPath = join(__dirname, '../src/build-info.json');

try {
  writeFileSync(docsPath, JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info written to docs/build-info.json');
} catch (err) {
  // docs/ might not exist yet during prebuild
  console.log('ℹ️  docs/ not yet created (normal during prebuild)');
}

try {
  writeFileSync(srcPath, JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info written to src/build-info.json');
} catch (err) {
  console.error('❌ Failed to write src/build-info.json:', err.message);
}

