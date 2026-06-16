/**
 * Convert logo to PNG and remove connected white background (keeps snow/fish whites).
 * Requires: npx -p sharp node scripts/make-logo-transparent.cjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const input = path.join(__dirname, "..", "public", "logo.png");
const output = input;

function isBackgroundWhite(r, g, b, a, threshold = 248) {
  return a > 200 && r >= threshold && g >= threshold && b >= threshold;
}

function floodRemoveBackground(width, height, pixels) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const pushIfBg = (x, y) => {
    const i = (y * width + x) * 4;
    if (!isBackgroundWhite(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    const pi = idx * 4;
    pixels[pi + 3] = 0;

    if (x > 0) pushIfBg(x - 1, y);
    if (x < width - 1) pushIfBg(x + 1, y);
    if (y > 0) pushIfBg(x, y - 1);
    if (y < height - 1) pushIfBg(x, y + 1);
  }
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  floodRemoveBackground(info.width, info.height, pixels);

  const tmp = `${output}.tmp.png`;
  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(tmp);
  fs.renameSync(tmp, output);
  console.log(`Wrote transparent PNG: ${output} (${info.width}x${info.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
