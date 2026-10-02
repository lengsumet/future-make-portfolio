// Screenshots pages of the running portfolio for design review.
//   node scripts/shot.mjs <base> <outDir> <name>:<path>[:full|:mobile] ...
// Waits past the loading screen, then captures the viewport (or the full page).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [base, out, ...targets] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const target of targets) {
  const [name, path, mode] = target.split(":");
  const mobile = mode === "mobile";
  const page = await browser.newPage({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3500);
  if (mode === "full") {
    // Walk down the page so scroll-triggered reveals fire, then return.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: `${out}/${name}.jpg`, type: "jpeg", quality: 62, fullPage: mode === "full" });
  console.log(`${name}: ${errors.length ? `${errors.length} console error(s): ${errors[0].slice(0, 120)}` : "no console errors"}`);
  await page.close();
}
await browser.close();
