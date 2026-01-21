import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1890ff"/>
      <stop offset="100%" style="stop-color:#096dd9"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#bg)"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="5"/>
  <line x1="50" y1="50" x2="50" y2="28" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <line x1="50" y1="50" x2="65" y2="50" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="4" fill="white"/>
</svg>`;

const publicDir = join(__dirname, '..', 'public');

async function generateIcons() {
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const { name, size } of sizes) {
    const svgBuffer = Buffer.from(svgContent);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Generated: ${name}`);
  }

  // Generate favicon.ico (using 32x32 png as base)
  const ico32 = await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toBuffer();
  
  writeFileSync(join(publicDir, 'favicon.ico'), ico32);
  console.log('Generated: favicon.ico');

  console.log('\n✅ PWA icons generated successfully!');
}

generateIcons().catch(console.error);
