// Screenshots van de site op 1280 en 375 pixels, voor controle in de cloud.
// Gebruik: NODE_PATH=$(npm root -g) node tools/shot.js <uitmap> [tijdstippen in s]
// Met tijdstippen worden alle animaties op die momenten stilgezet, zodat de
// intro beeld per beeld te bekijken is. De intro speelt maar eenmaal per
// sessie, en elke nieuwe pagina hier is een nieuwe sessie: hij speelt dus altijd.
const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const uit = process.argv[2] || ".";
  const tijden = process.argv.slice(3).map(Number);
  const url = process.env.URL || "http://localhost:4322/";
  fs.mkdirSync(uit, { recursive: true });
  const browser = await chromium.launch();
  for (const breedte of [1280, 375]) {
    const page = await browser.newPage({ viewport: { width: breedte, height: breedte === 375 ? 812 : 800 } });
    const fouten = [];
    page.on("pageerror", (e) => fouten.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") fouten.push(m.text()); });
    await page.goto(url);
    await page.waitForTimeout(1500);
    if (tijden.length) {
      for (const t of tijden) {
        await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; }), t);
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${uit}/${breedte}_${t}s.png` });
      }
    } else {
      await page.waitForTimeout(6000);
      await page.screenshot({ path: `${uit}/${breedte}.png` });
    }
    const overloop = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`${breedte}px: ${fouten.length ? fouten.join(" | ") : "geen fouten"}${overloop ? ", HORIZONTALE OVERLOOP" : ""}`);
  }
  await browser.close();
})();
