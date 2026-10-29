import sharp from 'sharp';

async function testCloneInpaint() {
  const orig = 'src/assets/games/quiz/infocard.png';
  const { data, info } = await sharp(orig).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.from(data);

  // Cover badge, Quivio, trophy completely from y=34, x=34:
  for (let y = 34; y <= 165; y++) {
    for (let x = 34; x <= 435; x++) {
      const srcY = Math.min(height - 1, 180 + Math.round((y - 34) * 0.5));
      const srcIdx = (srcY * width + x) * channels;
      const targetIdx = (y * width + x) * channels;

      // Feather right edge
      let hWeight = 1.0;
      if (x > 395) {
        hWeight = 1.0 - (x - 395) / 40;
      }

      // Feather bottom edge
      let vWeight = 1.0;
      if (y > 150) {
        vWeight = 1.0 - (y - 150) / 15;
      }

      const totalWeight = Math.min(hWeight, vWeight);

      const blendedR = data[srcIdx];
      const blendedG = data[srcIdx + 1];
      const blendedB = data[srcIdx + 2];

      out[targetIdx] = Math.round(data[targetIdx] * (1 - totalWeight) + blendedR * totalWeight);
      out[targetIdx + 1] = Math.round(data[targetIdx + 1] * (1 - totalWeight) + blendedG * totalWeight);
      out[targetIdx + 2] = Math.round(data[targetIdx + 2] * (1 - totalWeight) + blendedB * totalWeight);
      if (channels === 4) {
        out[targetIdx + 3] = 255;
      }
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .toFile('src/assets/games/quiz/infocard_clean_canvas.png');

  console.log('Saved with y=34, x=34');
}

testCloneInpaint().catch(console.error);
