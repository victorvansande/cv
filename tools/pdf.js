// De downloadbare cv-PDF's maken vanuit hun html-bron, ook in de cloud.
// Via Playwright en niet via chrome --print-to-pdf: die drukt af zodra de
// pagina geladen is, vaak nog voor de webfonts binnen zijn, en dan staat het
// cv in een vervanglettertype met een andere regelval.
// Gebruik: NODE_PATH=$(npm root -g) node tools/pdf.js [bron.html uit.pdf]
// Zonder argumenten: cv-print.html -> assets/cv-victor-van-sande.pdf
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const bron = path.resolve(__dirname, "..", process.argv[2] || "cv-print.html");
  const uit = path.resolve(__dirname, "..", process.argv[3] || "assets/cv-victor-van-sande.pdf");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + bron, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // cv-print.html zet na de fonts nog de portretpil met een script
  await page.waitForTimeout(300);
  await page.pdf({ path: uit, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(uit);
})();
