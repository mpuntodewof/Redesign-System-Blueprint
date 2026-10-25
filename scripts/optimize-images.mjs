// Generates the responsive WebP variants of the profile photo that Hero and
// About render.
//
// The 1024px PNG master lives in assets-src/ rather than public/ on purpose:
// anything in public/ is copied verbatim into dist/ and published, so keeping
// the 1.3 MB original there meant shipping it to visitors even though no
// markup referenced it.
//
// Run with `npm run optimize:images` after replacing assets-src/profile.png.

import sharp from "sharp";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets-src", "profile.png");

// Hero renders at 320px (lg:w-80), About at 256px. 640 covers both at 2x on
// the largest, and 320 keeps phones from paying for pixels they cannot show.
const variants = [
  { file: "profile-640.webp", width: 640 },
  { file: "profile-320.webp", width: 320 },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const before = statSync(source).size;
console.log(`source  profile.png  ${kb(before)}`);

let largest = 0;

for (const { file, width } of variants) {
  const out = path.join(root, "public", file);
  await sharp(source)
    .resize(width, width, { fit: "cover" })
    .webp({ quality: 82, effort: 6 })
    .toFile(out);

  const size = statSync(out).size;
  largest = Math.max(largest, size);
  console.log(`  wrote ${file.padEnd(18)} ${kb(size)}`);
}

const saved = ((1 - largest / before) * 100).toFixed(1);
console.log(`\nlargest variant is ${saved}% smaller than the PNG source`);
