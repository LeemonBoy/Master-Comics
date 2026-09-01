const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const frontendPublic = path.join(__dirname, '..', '..', 'frontend', 'public');
const svgPath = path.join(frontendPublic, 'favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { w: 16, h: 16, name: 'favicon-16x16.png' },
  { w: 32, h: 32, name: 'favicon-32x32.png' },
  { w: 180, h: 180, name: 'apple-touch-icon.png' },
];

(async () => {
  for (const { w, h, name } of sizes) {
    const outputPath = path.join(frontendPublic, name);
    await sharp(svgBuffer)
      .resize(w, h)
      .png()
      .toFile(outputPath);
    console.log(`Created: ${name} (${w}x${h})`);
  }
  console.log('All favicon files created!');
})();
