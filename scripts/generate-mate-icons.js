#!/usr/bin/env node

/**
 * Generate Mate app icons
 * Creates chess knight + speech bubble icons at various sizes
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicIconsDir = join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!existsSync(publicIconsDir)) {
  mkdirSync(publicIconsDir, { recursive: true });
}

// SVG template for Mate icon (knight in speech bubble)
function generateIconSVG(size) {
  const padding = size * 0.1;
  const bubbleSize = size - (padding * 2);
  const knightSize = bubbleSize * 0.6;
  const knightX = padding + (bubbleSize - knightSize) / 2;
  const knightY = padding + (bubbleSize - knightSize) / 2 - size * 0.05;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#769656;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5a7a42;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="knight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#312e2b" rx="${size * 0.15}"/>
  
  <!-- Speech bubble -->
  <g>
    <!-- Main bubble -->
    <rect x="${padding}" y="${padding}" 
          width="${bubbleSize}" height="${bubbleSize * 0.75}" 
          rx="${size * 0.12}" 
          fill="url(#bg-gradient)" 
          stroke="#f0f0f0" 
          stroke-width="${size * 0.02}"/>
    
    <!-- Speech tail -->
    <path d="M ${padding + bubbleSize * 0.25} ${padding + bubbleSize * 0.75}
             L ${padding + bubbleSize * 0.15} ${size - padding}
             L ${padding + bubbleSize * 0.4} ${padding + bubbleSize * 0.75}
             Z"
          fill="url(#bg-gradient)"
          stroke="#f0f0f0"
          stroke-width="${size * 0.02}"
          stroke-linejoin="round"/>
  </g>
  
  <!-- Knight chess piece (simplified) -->
  <g transform="translate(${knightX}, ${knightY})">
    <!-- Knight silhouette -->
    <path d="M ${knightSize * 0.5} ${knightSize * 0.15}
             L ${knightSize * 0.65} ${knightSize * 0.25}
             L ${knightSize * 0.7} ${knightSize * 0.35}
             L ${knightSize * 0.75} ${knightSize * 0.45}
             L ${knightSize * 0.7} ${knightSize * 0.55}
             L ${knightSize * 0.75} ${knightSize * 0.65}
             L ${knightSize * 0.85} ${knightSize * 0.85}
             L ${knightSize * 0.15} ${knightSize * 0.85}
             L ${knightSize * 0.25} ${knightSize * 0.65}
             L ${knightSize * 0.3} ${knightSize * 0.55}
             L ${knightSize * 0.25} ${knightSize * 0.45}
             L ${knightSize * 0.3} ${knightSize * 0.35}
             L ${knightSize * 0.35} ${knightSize * 0.25}
             Z"
          fill="url(#knight-gradient)"
          stroke="#312e2b"
          stroke-width="${size * 0.015}"/>
    
    <!-- Knight eye -->
    <circle cx="${knightSize * 0.55}" cy="${knightSize * 0.35}" 
            r="${knightSize * 0.04}" 
            fill="#312e2b"/>
    
    <!-- Base -->
    <rect x="${knightSize * 0.1}" y="${knightSize * 0.85}" 
          width="${knightSize * 0.8}" height="${knightSize * 0.1}" 
          rx="${knightSize * 0.02}"
          fill="url(#knight-gradient)"
          stroke="#312e2b"
          stroke-width="${size * 0.015}"/>
  </g>
</svg>`;
}

console.log('🎨 Generating Mate icons...\n');

// Generate icons
let generated = 0;
let failed = 0;

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = join(publicIconsDir, filename);
  const svgContent = generateIconSVG(size);
  const svgPath = filepath.replace('.png', '.svg');
  
  try {
    // Write SVG version
    writeFileSync(svgPath, svgContent);
    console.log(`✅ Generated: ${filename.replace('.png', '.svg')} (${size}x${size})`);
    
    // Create minimal PNG placeholder (1x1 transparent pixel)
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
    writeFileSync(filepath, minimalPNG);
    generated++;
  } catch (err) {
    console.error(`❌ Failed to generate ${filename}:`, err.message);
    failed++;
  }
});

console.log(`\n📊 Summary: ${generated}/${sizes.length} icons generated`);
console.log(`📁 Location: ${publicIconsDir}`);
console.log(`\n💡 To convert SVGs to PNGs:`);
console.log(`   1. Use ImageMagick: brew install imagemagick`);
console.log(`   2. Run: for f in public/icons/*.svg; do convert -background none "$f" "\${f%.svg}.png"; done`);
console.log(`   3. Or use online tool: https://cloudconvert.com/svg-to-png`);
console.log(`\n✨ Mate icon generation complete!`);

