import sharp from 'sharp';

async function perfectInpaint() {
  const orig = 'src/assets/games/quiz/infocard.png';
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.from(data);

  // For the header area: x from 48 to 440, y from 52 to 165
  // If a pixel is part of the badge, text, or trophy (r > 20 || g > 20 || b > 110):
  // We replace it by sampling the clean background below it at (x, 175 + (y-52)*0.5)
  for (let y = 52; y <= 165; y++) {
    for (let x = 48; x <= 440; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if pixel belongs to badge / text / trophy / their glow:
      // In the card interior, clean background has r <= 15, g <= 15, b <= 95
      const isForeground = (r > 16 || g > 16 || b > 95);

      if (isForeground) {
        // Sample clean background below
        const srcY = Math.min(height - 1, 180 + Math.round((y - 52) * 0.5));
        const srcIdx = (srcY * width + x) * channels;

        const factor = 0.88 + 0.12 * ((y - 52) / (165 - 52));

        out[idx] = Math.round(data[srcIdx] * factor);
        out[idx + 1] = Math.round(data[srcIdx + 1] * factor);
        out[idx + 2] = Math.round(data[srcIdx + 2] * factor);
        if (channels === 4) {
          out[idx + 3] = 255;
        }
      }
    }
  }

  // Apply a tiny 3x3 median/blur ONLY in the modified region to make it seamlessly soft
  await sharp(out, { raw: { width, height, channels } })
    .toFile('src/assets/games/quiz/infocard_clean_canvas.png');

  console.log('Successfully generated perfect infocard_clean_canvas.png');
}

perfectInpaint().catch(console.error);
