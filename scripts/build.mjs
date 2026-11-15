// Baut aus src/ eine einzelne, komplett eigenständige HTML-Datei (dist/goldfuchs-casino.html).
// Keine Abhängigkeiten nötig: `node scripts/build.mjs` (oder `npm run build`, `npm run watch`).
import { readFileSync, writeFileSync, mkdirSync, watch, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'dist', 'goldfuchs-casino.html');
const read = (p, enc = 'utf8') => readFileSync(join(src, p), enc);
const b64 = p => readFileSync(join(src, p)).toString('base64');

function inlineCss(path) {
  // url(../fonts/x.woff) -> eingebettete Schrift
  return read(path).replace(/url\(\.\.\/fonts\/([\w-]+)\.woff\)/g,
    (_, n) => `url(data:font/woff;base64,${b64(`fonts/${n}.woff`)})`);
}

function images() {
  const order = JSON.parse(read('assets/img/order.json'));
  const map = {};
  for (const k of order) {
    const svg = !existsSync(join(src, `assets/img/${k}.webp`)) && existsSync(join(src, `assets/img/${k}.svg`));
    map[k] = svg ? 'data:image/svg+xml;base64,' + b64(`assets/img/${k}.svg`) : 'data:image/webp;base64,' + b64(`assets/img/${k}.webp`);
  }
  return `const IMG=${JSON.stringify(map)};`;
}

// Musik und Klänge (MP3) aus assets/audio, Reihenfolge in order.json, im Code als AUD[name]
function audio() {
  const order = JSON.parse(read('assets/audio/order.json'));
  const map = {};
  for (const k of order) map[k] = b64(`assets/audio/${k}.mp3`);
  return `const AUD=${JSON.stringify(map)};`;
}

export function build() {
  const html = read('index.html')
    .replace(/<!--@css ([^>]+)-->/g, (_, p) => inlineCss(p))
    .replace(/<!--@images-->/g, () => images())
    .replace(/<!--@audio-->/g, () => audio())
    .replace(/<!--@js ([^>]+)-->/g, (_, p) => read(p));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`gebaut: dist/goldfuchs-casino.html (${(html.length / 1048576).toFixed(2)} MB)`);
}

build();
if (process.argv.includes('--watch')) {
  let t;
  watch(src, { recursive: true }, () => { clearTimeout(t); t = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 100); });
  console.log('beobachte src/ …');
}
