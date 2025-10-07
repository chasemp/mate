/**
 * Generate placeholder icon files for development
 * These are temporary - replace with actual icons later
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = join(__dirname, '../public/icons');

// Ensure icons directory exists
try {
  mkdirSync(iconsDir, { recursive: true });
} catch (err) {
  // Directory already exists
}

// Create minimal SVG icon data (chess piece)
const createIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#769656"/>
  <text x="50" y="65" font-size="60" text-anchor="middle" fill="white">♟</text>
</svg>`;

// Generate SVG files for each size
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = join(iconsDir, filename);
  
  try {
    writeFileSync(filepath, svg);
    console.log(`✅ Created ${filename}`);
  } catch (err) {
    console.error(`❌ Failed to create ${filename}:`, err.message);
  }
});

// Create PNGs as well (just text placeholders for now)
// In production, use proper PNG images
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = join(iconsDir, filename);
  
  // Create a minimal 1x1 PNG (placeholder)
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x62, 0xFC, 0xCF, 0xC0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D,
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  try {
    writeFileSync(filepath, minimalPNG);
    console.log(`✅ Created ${filename} (placeholder)`);
  } catch (err) {
    console.error(`❌ Failed to create ${filename}:`, err.message);
  }
});

console.log('\n✨ Icon placeholders generated!');
console.log('📝 Note: Replace with proper icons before production deployment.');

