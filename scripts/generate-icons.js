const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Ultra-premium modern Infotronics icon SVG
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040D21" />
      <stop offset="50%" stop-color="#0B2B64" />
      <stop offset="100%" stop-color="#081430" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#818CF8" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#FDE047" />
    </linearGradient>
    <linearGradient id="chipCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#0B132B" />
    </linearGradient>
  </defs>

  <!-- Background rounded squircle -->
  <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#bg)" />
  <rect x="20" y="20" width="472" height="472" rx="112" fill="none" stroke="url(#accent)" stroke-width="4" stroke-opacity="0.75" />

  <!-- Circuit traces background -->
  <g stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.32">
    <path d="M90 120 h 65 l 35 35 v 35" />
    <path d="M422 120 h -65 l -35 35 v 35" />
    <path d="M90 392 h 65 l 35 -35 v -35" />
    <path d="M422 392 h -65 l -35 -35 v -35" />
    <circle cx="90" cy="120" r="6" fill="#38BDF8" />
    <circle cx="422" cy="120" r="6" fill="#38BDF8" />
    <circle cx="90" cy="392" r="6" fill="#38BDF8" />
    <circle cx="422" cy="392" r="6" fill="#38BDF8" />
  </g>

  <!-- Glowing outer core ring -->
  <circle cx="256" cy="225" r="130" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="6 8" opacity="0.45" />
  
  <!-- Outer processor chip pins -->
  <g stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.9">
    <!-- Top pins -->
    <line x1="216" y1="110" x2="216" y2="135" />
    <line x1="256" y1="105" x2="256" y2="135" />
    <line x1="296" y1="110" x2="296" y2="135" />
    <!-- Bottom pins -->
    <line x1="216" y1="315" x2="216" y2="340" />
    <line x1="256" y1="315" x2="256" y2="345" />
    <line x1="296" y1="315" x2="296" y2="340" />
    <!-- Left pins -->
    <line x1="135" y1="185" x2="160" y2="185" />
    <line x1="130" y1="225" x2="160" y2="225" />
    <line x1="135" y1="265" x2="160" y2="265" />
    <!-- Right pins -->
    <line x1="352" y1="185" x2="377" y2="185" />
    <line x1="352" y1="225" x2="382" y2="225" />
    <line x1="352" y1="265" x2="377" y2="265" />
  </g>

  <!-- Central Microchip Box -->
  <rect x="160" y="135" width="192" height="180" rx="36" fill="url(#chipCore)" stroke="url(#accent)" stroke-width="4" />
  
  <!-- Embedded Hexagon Crest -->
  <polygon points="256,150 316,185 316,265 256,300 196,265 196,185" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-opacity="0.8" />

  <!-- Monogram GIT Typography -->
  <text x="256" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="62" font-weight="900" text-anchor="middle" fill="#FFFFFF" letter-spacing="4">
    GIT
  </text>
  
  <!-- Subtle tech subtitle on chip -->
  <text x="256" y="272" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle" fill="url(#gold)" letter-spacing="5">
    OFFICIEL
  </text>

  <!-- Bottom Badge: DIVISION GENIE INFOTRONIQUE -->
  <g transform="translate(256, 415)">
    <rect x="-165" y="-24" width="330" height="38" rx="19" fill="#0A1633" stroke="#38BDF8" stroke-width="1.5" stroke-opacity="0.6" />
    <text x="0" y="1" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle" fill="#F8FAFC" letter-spacing="3">
      GÉNIE INFOTRONIQUE
    </text>
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'app-icon.svg'), svg, 'utf8');

async function buildIcons() {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
  await sharp(buf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
  await sharp(buf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(buf).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));
  await sharp(buf).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(buf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  await sharp(buf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-maskable-192x192.png'));
  console.log('SUCCESS: All PWA icons generated!');
}

buildIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
