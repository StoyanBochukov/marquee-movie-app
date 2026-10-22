/**
 * Generates every icon from one vector definition of the Marquee mark:
 * a red "M" inside a ring of marquee bulbs.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Outputs
 *   assets/brand/*.svg                 source artwork (logo for the splash, full icon)
 *   ios/.../AppIcon.appiconset         single 1024px universal icon (no alpha, as Apple requires)
 *   android/.../mipmap-*               legacy square + round icons, adaptive layers + monochrome
 *   android/.../mipmap-anydpi-v26      adaptive icon definitions
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res');
const IOS_ICONSET = path.join(ROOT, 'ios/MovieTask/Images.xcassets/AppIcon.appiconset');
const BRAND_DIR = path.join(ROOT, 'assets/brand');

export const BACKGROUND = '#0A0A0F';
const BULB_COUNT = 20;

/** The mark in unit space: centered on (0,0), fits inside a circle of radius 1. */
function mark({ mono = false } = {}) {
  const red = mono ? '#FFFFFF' : 'url(#bar)';
  const darkRed = mono ? '#FFFFFF' : 'url(#fold)';

  const bulbs = Array.from({ length: BULB_COUNT }, (_, index) => {
    const angle = (index / BULB_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = (Math.cos(angle) * 0.9).toFixed(4);
    const y = (Math.sin(angle) * 0.9).toFixed(4);
    const lit = index % 2 === 0;
    if (mono)
      return `<circle cx="${x}" cy="${y}" r="0.055" fill="#FFFFFF" opacity="${lit ? 1 : 0.5}"/>`;
    return `
      ${lit ? `<circle cx="${x}" cy="${y}" r="0.11" fill="url(#glow)"/>` : ''}
      <circle cx="${x}" cy="${y}" r="0.055" fill="url(#bulb)" opacity="${lit ? 1 : 0.45}"/>`;
  }).join('');

  return `
    <g>
      ${bulbs}
      <!-- the fold of the M sits behind the uprights -->
      <polygon points="-0.46,-0.38 -0.25,-0.38 0,0.05 0.25,-0.38 0.46,-0.38 0,0.40" fill="${darkRed}"/>
      <rect x="-0.46" y="-0.38" width="0.21" height="0.78" rx="0.025" fill="${red}"/>
      <rect x="0.25" y="-0.38" width="0.21" height="0.78" rx="0.025" fill="${red}"/>
    </g>`;
}

const DEFS = `
  <defs>
    <linearGradient id="bar" x1="0" y1="-0.4" x2="0" y2="0.4" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FF3B45"/>
      <stop offset="0.55" stop-color="#E50914"/>
      <stop offset="1" stop-color="#A3060F"/>
    </linearGradient>
    <linearGradient id="fold" x1="0" y1="-0.4" x2="0" y2="0.4" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9E0710"/>
      <stop offset="1" stop-color="#6E040A"/>
    </linearGradient>
    <radialGradient id="bulb" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.45" stop-color="#FFE7AD"/>
      <stop offset="1" stop-color="#F5B53D"/>
    </radialGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="#FFD27A" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFD27A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="backdrop" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#2B070B"/>
      <stop offset="1" stop-color="${BACKGROUND}"/>
    </radialGradient>
  </defs>`;

/**
 * @param size   canvas size in px
 * @param radius mark radius as a fraction of the canvas
 */
function svg({ size, radius, background = false, mono = false, withMark = true }) {
  const scale = size * radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${DEFS}
  ${background ? `<rect width="${size}" height="${size}" fill="url(#backdrop)"/>` : ''}
  ${
    withMark
      ? `<g transform="translate(${size / 2} ${size / 2}) scale(${scale})">${mark({ mono })}</g>`
      : ''
  }
</svg>`;
}

/** Android adaptive icons: 108dp canvas, only the central 66dp circle is guaranteed visible. */
const ADAPTIVE_RADIUS = 0.31;
/** iOS / legacy icons are full-bleed squares (the OS rounds the corners). */
const FULL_ICON_RADIUS = 0.4;

const ANDROID_DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const render = (source, size) => sharp(Buffer.from(source)).resize(size, size).png();

async function write(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

async function generateBrandSources() {
  await write(path.join(BRAND_DIR, 'logo.svg'), svg({ size: 512, radius: 0.5 }));
  await write(
    path.join(BRAND_DIR, 'icon.svg'),
    svg({ size: 1024, radius: FULL_ICON_RADIUS, background: true }),
  );
}

async function generateIos() {
  const icon = svg({ size: 1024, radius: FULL_ICON_RADIUS, background: true });
  await write(
    path.join(IOS_ICONSET, 'AppIcon-1024.png'),
    await render(icon, 1024).flatten({ background: BACKGROUND }).removeAlpha().toBuffer(),
  );
  await write(
    path.join(IOS_ICONSET, 'Contents.json'),
    `${JSON.stringify(
      {
        images: [
          { filename: 'AppIcon-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' },
        ],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2,
    )}\n`,
  );
}

async function generateAndroid() {
  const full = svg({ size: 1024, radius: FULL_ICON_RADIUS, background: true });
  const foreground = svg({ size: 1024, radius: ADAPTIVE_RADIUS });
  const monochrome = svg({ size: 1024, radius: ADAPTIVE_RADIUS, mono: true });
  const backdrop = svg({ size: 1024, radius: 0, background: true, withMark: false });
  const circleMask = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><circle cx="512" cy="512" r="512"/></svg>',
  );

  for (const [density, factor] of Object.entries(ANDROID_DENSITIES)) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    const legacy = Math.round(48 * factor);
    const adaptive = Math.round(108 * factor);

    await write(path.join(dir, 'ic_launcher.png'), await render(full, legacy).toBuffer());
    const round = await sharp(Buffer.from(full))
      .resize(1024, 1024)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    await write(
      path.join(dir, 'ic_launcher_round.png'),
      await sharp(round).resize(legacy, legacy).png().toBuffer(),
    );
    await write(
      path.join(dir, 'ic_launcher_foreground.png'),
      await render(foreground, adaptive).toBuffer(),
    );
    await write(
      path.join(dir, 'ic_launcher_background.png'),
      await render(backdrop, adaptive).toBuffer(),
    );
    await write(
      path.join(dir, 'ic_launcher_monochrome.png'),
      await render(monochrome, adaptive).toBuffer(),
    );
  }

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
`;
  const anydpi = path.join(ANDROID_RES, 'mipmap-anydpi-v26');
  await write(path.join(anydpi, 'ic_launcher.xml'), adaptiveXml);
  await write(path.join(anydpi, 'ic_launcher_round.xml'), adaptiveXml);
}

await generateBrandSources();
await generateIos();
await generateAndroid();
console.log('Brand assets generated.');
