// Renders scripts/og-template.html to public/og-image.png (1200×630).
// Usage: npm run og:image   (set CHROME_PATH if Chrome is not in the default Windows location)
import { chromium } from "playwright-core";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executablePath = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(root, "scripts/og-template.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: "png" });
// Palette-quantise: the raw screenshot is ~370 KB (dithering-free gradients + 3.7k dots); this keeps it well under 300 KB.
await sharp(shot).png({ palette: true, quality: 90, effort: 10, colours: 128 }).toFile(path.join(root, "public/og-image.png"));
await browser.close();
console.log("wrote public/og-image.png");
