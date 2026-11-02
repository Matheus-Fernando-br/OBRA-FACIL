// Salva cada <section> de slides.html como PNG 1080x1350 (uso: node _png.cjs PASTA)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const dir = path.resolve(process.argv[2]); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('file://' + dir + '/slides.html'); await p.waitForTimeout(500);
  const s = p.locator('section'); const n = await s.count();
  for (let i = 0; i < n; i++) await s.nth(i).screenshot({ path: `${dir}/slide-${String(i + 1).padStart(2, '0')}.png` });
  console.log(n, 'PNGs'); await b.close();
})();
