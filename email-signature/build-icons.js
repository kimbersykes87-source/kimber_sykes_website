const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const iconsDir = path.join(__dirname, 'assets', 'icons');
const size = 64; // Generate at 64x64; signature HTML displays at 16x16 for sharp rendering

['phone', 'email', 'web', 'linkedin'].forEach((name) => {
  const svgPath = path.join(iconsDir, `${name}.svg`);
  const pngPath = path.join(iconsDir, `${name}.png`);
  let svg = fs.readFileSync(svgPath, 'utf8');
  // Strip XML declaration if present (resvg can be strict)
  svg = svg.replace(/^\s*<\?xml[^?]*\?>\s*/i, '');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0, 0, 0, 0)',
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`Generated ${name}.png (${pngData.width}x${pngData.height})`);
});

console.log('Done. Use the .png files in the email signature.');
