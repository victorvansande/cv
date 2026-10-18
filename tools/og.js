// Linkafbeelding voor de cloud: assets/og-source.html op 1200x630 naar
// assets/og-image.jpg. Doet hetzelfde als assets/og-gen.ps1 op Windows.
// Via Playwright en niet via chrome --screenshot: die laatste rekent in de
// nieuwe headless-modus zijn venster mee en snijdt onderaan zo'n 90 pixels af.
// Gebruik: NODE_PATH=$(npm root -g) node tools/og.js
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("file://" + path.resolve(__dirname, "../assets/og-source.html"));
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.resolve(__dirname, "../assets/og-image.jpg"), type: "jpeg", quality: 90 });
  await browser.close();
})();
