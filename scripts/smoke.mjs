// Startet die gebaute App in einem Headless-Browser und meldet JavaScript-Fehler.
// Braucht Playwright (`npm i -D playwright`), in Claude-Cloud-Sessions ist es vorinstalliert.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

let pw;
try { pw = await import('playwright'); }
catch { pw = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright'); }
const { chromium } = pw;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => m.type() === 'error' && errors.push(m.text()));
await p.goto(pathToFileURL(resolve('dist/goldfuchs-casino.html')).href);
await p.waitForTimeout(4000);
await p.mouse.click(195, 600);
await p.waitForTimeout(1500);
if (process.argv[2]) await p.screenshot({ path: process.argv[2] });
await b.close();
if (errors.length) { console.error('Fehler:\n' + errors.join('\n')); process.exit(1); }
console.log('Smoke-Test ok: keine JavaScript-Fehler');
