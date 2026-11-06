#!/usr/bin/env node
// Optional browser smoke test. Requires Playwright and a Chromium/Chrome executable.
// npm install --no-save playwright && npx playwright install chromium
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = require(process.env.OIA_PLAYWRIGHT_MODULE || 'playwright');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const target = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!target.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const content = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

function snapshot() { return window.__oiaTerrainLab?.getStats?.() ?? null; }

async function main() {
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  const args = process.env.OIA_SWIFTSHADER === '1' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
  if (process.env.OIA_NO_SANDBOX === '1') args.push('--no-sandbox');
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_EXECUTABLE || undefined,
    args,
    timeout: 30000
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    const exceptions = [];
    page.on('pageerror', e => exceptions.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') exceptions.push('console: ' + m.text()); });
    const url = 'http://127.0.0.1:' + server.address().port + '/labs/terrain-lod/';
    const response = await page.goto(url, { waitUntil: 'load' });
    assert.equal(response.status(), 200, 'demo HTTP response');
    await page.waitForFunction(() => window.__oiaTerrainLab?.getStats?.().triangleCount > 0, { timeout: 25000 });
    const initial = await page.evaluate(snapshot);
    assert.equal(initial.terrainTiles, 49);
    assert.equal(initial.renderer, 'WebGL2');
    assert.equal(initial.glErrorCode, 0);

    await page.locator('#mode').selectOption('low');
    await page.waitForFunction(() => window.__oiaTerrainLab.getStats().lodCounts[0] === 49);
    const low = await page.evaluate(snapshot);
    await page.locator('#mode').selectOption('high');
    await page.waitForFunction(() => window.__oiaTerrainLab.getStats().lodCounts[2] === 49);
    const high = await page.evaluate(snapshot);
    assert.ok(high.triangleCount > low.triangleCount, 'high LOD must use more triangles');
    assert.equal(high.glErrorCode, 0);

    await page.locator('#wireframe').check();
    await page.locator('#fog').uncheck();
    const changed = await page.evaluate(snapshot);
    assert.equal(changed.wireframe, true);
    assert.equal(changed.fog, false);
    const before = changed.cameraDistance;
    await page.locator('canvas').hover();
    await page.mouse.wheel(0, -320);
    await page.mouse.move(420, 350);
    await page.mouse.down();
    await page.mouse.move(620, 410, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const interacted = await page.evaluate(snapshot);
    assert.ok(interacted.cameraDistance < before, 'wheel should zoom in');
    assert.notEqual(interacted.cameraYaw, changed.cameraYaw, 'drag should orbit');

    await page.locator('#reset').click();
    await page.locator('#mode').selectOption('auto');
    await page.locator('#wireframe').uncheck();
    await page.locator('#fog').check();
    await page.waitForTimeout(950);
    const final = await page.evaluate(snapshot);
    assert.equal(final.cameraDistance, 35);
    assert.equal(final.glErrorCode, 0);
    assert.ok(final.fps > 0, 'live frame loop should progress');
    assert.deepEqual(exceptions, [], 'no JavaScript errors');
    const screenshot = process.env.OIA_SCREENSHOT || '/tmp/oia-terrain-lod-smoke.png';
    await page.screenshot({ path: screenshot, fullPage: false });
    console.log(JSON.stringify({ result: 'PASS', renderer: final.renderer, tiles: final.terrainTiles,
      initialLOD: initial.lodCounts, lowTriangles: low.triangleCount,
      highTriangles: high.triangleCount, finalLOD: final.lodCounts, fpsInTest: final.fps,
      p95FrameIntervalMsInTest: final.frameIntervalP95Ms, screenshot }, null, 2));
    console.log('These are test-environment observations, not a GPU benchmark or production FPS guarantee.');
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error('TERRAIN_LAB_SMOKE_FAILED:', e.stack); process.exitCode = 1; })
  .finally(() => server.close());
